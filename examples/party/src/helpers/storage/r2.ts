export type R2StorageConfig = {
        accountId: string
        accessKeyId: string
        secretAccessKey: string
        bucketName: string
        endpoint?: string
}

export type StoredVoxelData = {
        id: string
        region: string
        data: Uint8Array
        metadata: {
                lat: number
                lng: number
                zoom: number
                size: number[]
                createdAt: number
                lastAccessed: number
        }
}

const R2_ENDPOINTS = {
        default: 'https://[account-id].r2.cloudflarestorage.com',
        custom: (accountId: string) => `https://${accountId}.r2.cloudflarestorage.com`
}

export const createR2Client = (config: R2StorageConfig) => {
        const endpoint = config.endpoint || R2_ENDPOINTS.custom(config.accountId)
        
        const buildUrl = (key: string) => `${endpoint}/${config.bucketName}/${key}`
        
        const buildHeaders = (method: string, contentType?: string) => {
                const headers: Record<string, string> = {
                        'Authorization': `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}`,
                        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
                        'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
                }
                
                if (contentType) {
                        headers['Content-Type'] = contentType
                }
                
                return headers
        }
        
        const store = async (key: string, data: Uint8Array, contentType: string = 'application/octet-stream'): Promise<boolean> => {
                const url = buildUrl(key)
                const headers = buildHeaders('PUT', contentType)
                
                const response = await fetch(url, {
                        method: 'PUT',
                        headers,
                        body: data
                })
                
                return response.ok
        }
        
        const retrieve = async (key: string): Promise<Uint8Array | null> => {
                const url = buildUrl(key)
                const headers = buildHeaders('GET')
                
                const response = await fetch(url, { headers })
                if (!response.ok) return null
                
                const buffer = await response.arrayBuffer()
                return new Uint8Array(buffer)
        }
        
        const exists = async (key: string): Promise<boolean> => {
                const url = buildUrl(key)
                const headers = buildHeaders('HEAD')
                
                const response = await fetch(url, { method: 'HEAD', headers })
                return response.ok
        }
        
        const remove = async (key: string): Promise<boolean> => {
                const url = buildUrl(key)
                const headers = buildHeaders('DELETE')
                
                const response = await fetch(url, { method: 'DELETE', headers })
                return response.ok
        }
        
        const list = async (prefix: string = ''): Promise<string[]> => {
                const url = buildUrl('?list-type=2' + (prefix ? `&prefix=${prefix}` : ''))
                const headers = buildHeaders('GET')
                
                const response = await fetch(url, { headers })
                if (!response.ok) return []
                
                const text = await response.text()
                const keys: string[] = []
                
                // Simple XML parsing for S3 ListObjectsV2 response
                const keyMatches = text.match(/<Key>([^<]+)<\/Key>/g)
                if (keyMatches) {
                        keys.push(...keyMatches.map(match => match.replace(/<\/?Key>/g, '')))
                }
                
                return keys
        }
        
        return { store, retrieve, exists, remove, list }
}

export const generateVoxelKey = (lat: number, lng: number, zoom: number, size: number): string => {
        const latStr = lat.toFixed(4)
        const lngStr = lng.toFixed(4)
        return `voxels/${latStr}_${lngStr}_${zoom}_${size}.bin`
}

export const generateRegionPrefix = (lat: number, lng: number): string => {
        const latStr = lat.toFixed(2)
        const lngStr = lng.toFixed(2)
        return `voxels/${latStr}_${lngStr}`
}

export const storeVoxelData = async (r2: ReturnType<typeof createR2Client>, data: StoredVoxelData): Promise<boolean> => {
        const key = generateVoxelKey(data.metadata.lat, data.metadata.lng, data.metadata.zoom, data.metadata.size[0])
        
        // Create binary format: metadata + data
        const metadataStr = JSON.stringify(data.metadata)
        const metadataBytes = new TextEncoder().encode(metadataStr)
        const metadataLength = new Uint32Array([metadataBytes.length])
        
        const combined = new Uint8Array(4 + metadataBytes.length + data.data.length)
        combined.set(new Uint8Array(metadataLength.buffer), 0)
        combined.set(metadataBytes, 4)
        combined.set(data.data, 4 + metadataBytes.length)
        
        return await r2.store(key, combined)
}

export const retrieveVoxelData = async (r2: ReturnType<typeof createR2Client>, lat: number, lng: number, zoom: number, size: number): Promise<StoredVoxelData | null> => {
        const key = generateVoxelKey(lat, lng, zoom, size)
        const combined = await r2.retrieve(key)
        
        if (!combined) return null
        
        // Parse binary format
        const metadataLength = new Uint32Array(combined.buffer, 0, 1)[0]
        const metadataBytes = combined.slice(4, 4 + metadataLength)
        const data = combined.slice(4 + metadataLength)
        
        const metadataStr = new TextDecoder().decode(metadataBytes)
        const metadata = JSON.parse(metadataStr)
        
        // Update last accessed time
        metadata.lastAccessed = Date.now()
        
        return {
                id: key,
                region: `${lat.toFixed(4)}_${lng.toFixed(4)}`,
                data,
                metadata
        }
}

export const checkVoxelExists = async (r2: ReturnType<typeof createR2Client>, lat: number, lng: number, zoom: number, size: number): Promise<boolean> => {
        const key = generateVoxelKey(lat, lng, zoom, size)
        return await r2.exists(key)
}

export const cleanupOldVoxels = async (r2: ReturnType<typeof createR2Client>, maxAge: number = 2592000000): Promise<number> => {
        const keys = await r2.list('voxels/')
        let cleaned = 0
        
        for (const key of keys) {
                const data = await retrieveVoxelData(
                        r2,
                        parseFloat(key.split('_')[0].replace('voxels/', '')),
                        parseFloat(key.split('_')[1]),
                        parseInt(key.split('_')[2]),
                        parseInt(key.split('_')[3].replace('.bin', ''))
                )
                
                if (data && Date.now() - data.metadata.lastAccessed > maxAge) {
                        await r2.remove(key)
                        cleaned++
                }
        }
        
        return cleaned
}
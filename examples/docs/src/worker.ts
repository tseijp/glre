import { greedyMesh } from 'voxelized-rs'
import { createWorkerHandler } from 'voxelized-js/worker'

self.onmessage = createWorkerHandler(greedyMesh)

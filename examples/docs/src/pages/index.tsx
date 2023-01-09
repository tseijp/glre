import React from 'react'
import Head from '@docusaurus/Head'
import Layout from '@theme/Layout'
import { useGL, useFrame } from '@glre/react/index'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function Home() {
        const { siteConfig } = useDocusaurusContext();
        return (
          <Layout noFooter>
            <Head>
              <title>
                {siteConfig.title} {siteConfig.titleDelimiter} {siteConfig.tagline}
              </title>
            </Head>
            <main style={{ overflow: "hidden" }}>
              <Canvas style={{ top: 0, left: 0, position: 'fixed', zIndex: -1 }}/>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <h1 style={{ fontSize: "10rem" }}>GLRE</h1>
                <div style={{ fontSize: "5rem" }}>GLSL Reactive Engine</div>
                <a style={{ color: "#212121" }} href="/docs">Getting started</a>
                <a style={{ color: "#212121" }} href="https://codesandbox.io/s/glre-test3-ntlk3l">Try demo</a>
              </div>
            </main>
          </Layout>
        );
}

function Canvas (props: any) {
        const gl = useGL()`
                precision highp float;
                uniform vec2 resolution;
                void main() {
                        gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
                }
        `
        useFrame(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
        })
        return <canvas id={gl.id} {...props} />
}
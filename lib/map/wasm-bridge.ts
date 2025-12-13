// lib/map/wasm-bridge.ts

interface MapForgeExports {
    TerrainOps: {
        GenerateHeightmap: (seed: number, size: number, scale: number, persistence: number, lacunarity: number) => number[];
        CalculateErosion: (heightmap: number[], size: number, iterations: number) => number[];
    }
}

let wasmExports: MapForgeExports | null = null;

export async function initWasmBridge() {
    if (wasmExports) return wasmExports;

    console.log("Initializing C# WASM Bridge...");
    
    try {
        // Dynamic import from public folder
        // @ts-ignore
        const { dotnet } = await import(/* webpackIgnore: true */ '/wasm/dotnet.js');
        
        const { getAssemblyExports, getConfig } = await dotnet
            .withDiagnosticTracing(false)
            .create();

        const config = getConfig();
        const exports = await getAssemblyExports(config.mainAssemblyName);
        
        // Structure matches namespace: MapForge.Core.TerrainOps
        wasmExports = exports.MapForge.Core as MapForgeExports;
        console.log("WASM Bridge Initialized", wasmExports);
        return wasmExports;
    } catch (e) {
        console.error("Failed to init WASM bridge", e);
        throw e;
    }
}

export async function generateTerrainMap(seed: number, size: number): Promise<Float32Array> {
    const exports = await initWasmBridge();
    if (!exports) throw new Error("WASM not initialized");

    console.time("WASM_GenerateTerrain");
    const data = exports.TerrainOps.GenerateHeightmap(seed, size, 0.02, 0.5, 2.0);
    console.timeEnd("WASM_GenerateTerrain");
    
    return new Float32Array(data);
}

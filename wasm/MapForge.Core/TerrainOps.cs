using System;
using System.Runtime.InteropServices.JavaScript;

namespace MapForge.Core
{
    public partial class TerrainOps
    {
        [JSExport]
        [return: JSMarshalAs<JSType.Array<JSType.Number>>]
        public static double[] GenerateHeightmap(int seed, int size, double scale, double persistence, double lacunarity)
        {
            var map = new double[size * size];
            var noise = new FastNoiseLite(seed);
            
            // noise.SetNoiseType(FastNoiseLite.NoiseType.Perlin);
            // noise.SetFrequency((float)scale);

            // Simple fBm implementation
            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    double amplitude = 1;
                    double frequency = 1;
                    double noiseHeight = 0;
                    double normalization = 0;

                    for (int i = 0; i < 4; i++) // 4 octaves
                    {
                        noiseHeight += noise.GetNoise((float)(x * frequency), (float)(y * frequency)) * amplitude;
                        normalization += amplitude;

                        amplitude *= persistence;
                        frequency *= lacunarity;
                    }

                    map[y * size + x] = noiseHeight / normalization;
                }
            }

            return map;
        }

        [JSExport]
        [return: JSMarshalAs<JSType.Array<JSType.Number>>]
        public static double[] CalculateErosion([JSMarshalAs<JSType.Array<JSType.Number>>] double[] heightmap, int size, int iterations)
        {
            // Placeholder for hydraulic erosion simulation
            return heightmap;
        }
    }

    // Minimal FastNoiseLite implementation for example
    public class FastNoiseLite 
    {
        private int _seed;
        public enum NoiseType { Perlin, OpenSimplex2 }
        
        public FastNoiseLite(int seed) { _seed = seed; }
        public void SetNoiseType(NoiseType type) { }
        public void SetFrequency(float freq) { }
        public float GetNoise(float x, float y) 
        { 
            // Mock noise for compilation - simple sin wave
            return (float)(Math.Sin(x * 0.1f + _seed) * Math.Cos(y * 0.1f)); 
        }
    }
}

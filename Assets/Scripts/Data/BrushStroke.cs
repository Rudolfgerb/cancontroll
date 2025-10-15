using UnityEngine;
using System.Collections.Generic;

[System.Serializable]
public class BrushStroke
{
    public string strokeId;
    public BrushType brushType;
    public List<Vector2> points; // Normalized coordinates (0-1)
    public Color strokeColor;
    public float strokeSize;
    public float opacity;
    public DateTime timestamp;
}

public enum BrushType {
    SprayCan,      // Standard spray can
    FatCap,        // Wide nozzle
    SkinnyCap,     // Narrow nozzle
    Marker,        // Edding/Marker
    PaintRoller,   // Roller for large areas
    PaintBucket    // Bucket for fills
}

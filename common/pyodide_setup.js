let pyodide;

async function loadPyodide() {
    if (!pyodide) {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
        });
        
        // 安装必要的库
        await pyodide.loadPackage(["pandas", "numpy", "scikit-learn"]);
        
        // 配置环境
        pyodide.runPython(`
            import pandas as pd
            import numpy as np
            from sklearn.cluster import KMeans
            from sklearn.metrics import silhouette_score
        `);
    }
    return pyodide;
}

async function initializePyodide() {
    try {
        await loadPyodide();
        console.log("Pyodide initialized successfully");
        return true;
    } catch (error) {
        console.error("Failed to initialize Pyodide:", error);
        return false;
    }
}
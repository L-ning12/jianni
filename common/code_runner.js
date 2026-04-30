// Code runner utility - executes Python code and handles output
import { initPyodide } from './pyodide_setup.js';

// Helper to convert DataFrame to HTML table
function dataframeToTable(df) {
    try {
        // Get column names
        const columns = df.columns.toJs();
        // Get first 20 rows
        const data = df.head(20).to_js();
        
        let html = '<table class="data-table w-full text-sm">';
        html += '<thead><tr>';
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead>';
        html += '<tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                html += `<td class="code-font">${row[col]}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        if (df.shape[0] > 20) {
            html += `<p class="text-slate-400 text-xs mt-2">... showing 20 of ${df.shape[0]} rows</p>`;
        }
        return html;
    } catch (e) {
        return `<p class="text-red-400">Failed to render table: ${e}</p>`;
    }
}

export async function runCode(code, onOutput) {
    try {
        const pyodide = await initPyodide();
        
        // Capture print output
        let stdout = '';
        const oldPrint = pyodide.globals.get('print');
        
        pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = capture_stdout = StringIO()
`);
        
        try {
            // Run the code
            const result = await pyodide.runPythonAsync(code);
            
            // Get captured stdout
            const capturedOutput = pyodide.runPython(`
capture_stdout.getvalue()
`);
            
            if (capturedOutput) {
                stdout += capturedOutput;
            }
            
            // Check if result is a DataFrame
            if (result && result.type && result.type.__name__ === 'DataFrame') {
                onOutput({
                    type: 'table',
                    content: dataframeToTable(result)
                });
            } else if (result !== undefined && result !== null) {
                onOutput({
                    type: 'text',
                    content: String(result)
                });
            }
            
            if (stdout) {
                onOutput({
                    type: 'text',
                    content: stdout
                });
            }
            
        } finally {
            // Restore stdout
            pyodide.runPython(`
import sys
sys.stdout = sys.__stdout__
`);
        }
        
    } catch (error) {
        onOutput({
            type: 'error',
            content: String(error)
        });
    }
}

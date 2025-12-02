# ORF Finder

A web-based tool for identifying Open Reading Frames (ORFs) in nucleotide sequences with integrated BLAST homology search and history tracking.

## Features

- 🔍 **ORF Detection**: Finds ORFs in all 6 reading frames (+1, +2, +3, -1, -2, -3)
- 🧬 **BLAST Integration**: Automated BLASTP homology searches via NCBI
- 📊 **History Tracking**: Saves results to CSV files with unique Task IDs
- 💾 **Load Previous Results**: Reload past analyses by Task ID
- 🎯 **Selective Analysis**: Choose specific ORFs for homology checking

## Requirements

- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd orf_finder
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure NCBI Email** (Required)
   
   Edit `server.py` and replace the email address:
   ```python
   Entrez.email = "your_email@example.com"  # Change this!
   ```

## Usage

1. **Start the Flask server**
   ```bash
   python server.py
   ```

2. **Open the web interface**
   - Open `index.html` in your browser
   - Or navigate to the file location

3. **Find ORFs**
   - Paste your DNA/RNA sequence
   - Set minimum length (default: 75 aa)
   - Click "Find ORFs"

4. **Run Homology Checks**
   - Select specific ORFs or use "Run All"
   - Results update automatically
   - Saved to `history/YYYYMMDD_HHMMSS.csv`

5. **Load Previous Results**
   - Enter Task ID (e.g., `20231202_120000`)
   - Click "Load History"

## File Structure

```
orf_finder/
├── index.html          # Main web interface
├── script.js           # Frontend logic
├── style.css           # Styling
├── server.py           # Flask backend for BLAST
├── requirements.txt    # Python dependencies
├── README.md           # This file
├── .gitignore          # Git ignore rules
└── history/            # Saved results (auto-created)
    └── *.csv
```

## Notes

- **NCBI Rate Limits**: Homology checks run sequentially with 3-second delays
- **History Files**: Each "Find ORFs" creates a unique CSV file
- **Internet Required**: BLAST searches require internet connection

## Troubleshooting

**Server not starting?**
- Check if port 5000 is available
- Try changing the port in `server.py`: `app.run(port=5001)`

**BLAST timeout?**
- NCBI servers can be slow
- Wait longer or reduce sequence length

**History not loading?**
- Ensure `history/` folder exists
- Check Task ID format (YYYYMMDD_HHMMSS)

## License

MIT License - Feel free to use and modify!

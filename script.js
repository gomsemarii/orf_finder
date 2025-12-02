document.addEventListener('DOMContentLoaded', () => {
    const sequenceInput = document.getElementById('sequence-input');
    const minLengthInput = document.getElementById('min-length');
    const findBtn = document.getElementById('find-btn');
    const revCompBtn = document.getElementById('rev-comp-btn');
    const resultsSection = document.getElementById('results-section');
    const revCompSection = document.getElementById('rev-comp-section');
    const revCompOutput = document.getElementById('rev-comp-output');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const summaryDiv = document.getElementById('summary');

    const runSelectedBtn = document.getElementById('run-selected-btn');
    const runAllBtn = document.getElementById('run-all-btn');
    const selectAllCheckbox = document.getElementById('select-all');

    const loadTaskInput = document.getElementById('load-task-id');
    const loadBtn = document.getElementById('load-btn');

    let currentTaskId = null;

    findBtn.addEventListener('click', async () => {
        const sequence = getCleanSequence();
        if (!sequence) return;

        // Generate new Task ID
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
        currentTaskId = `${dateStr}_${timeStr}`;

        const minLengthAa = parseInt(minLengthInput.value, 10) || 75;
        const minLengthBp = minLengthAa * 3;
        const orfs = findAllORFs(sequence, minLengthBp);

        displayResults(orfs);
        revCompSection.classList.add('hidden');

        // Initialize Task on Backend
        try {
            const orfData = orfs.map((orf, index) => ({
                orf_number: index + 1,
                protein: orf.protein,
                lengthAa: orf.lengthAa,
                strand: orf.strand,
                frame: orf.frame,
                start: orf.start,
                end: orf.end,
                lengthBp: orf.lengthBp
            }));

            await fetch('http://localhost:5000/init_task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: currentTaskId, orfs: orfData })
            });
            console.log(`Task ${currentTaskId} initialized.`);
        } catch (err) {
            console.error("Failed to initialize task:", err);
            alert("Warning: Failed to save initial task data to server.");
        }
    });

    loadBtn.addEventListener('click', async () => {
        const taskId = loadTaskInput.value.trim();
        if (!taskId) {
            alert("Please enter a Task ID.");
            return;
        }

        try {
            loadBtn.disabled = true;
            loadBtn.textContent = "Loading...";

            const response = await fetch(`http://localhost:5000/history?task_id=${taskId}`);
            if (!response.ok) {
                throw new Error("Task not found or server error");
            }

            const data = await response.json();
            currentTaskId = data.task_id;

            // Reconstruct ORFs from history data
            const orfs = data.orfs.map(row => ({
                strand: row.strand,
                frame: row.frame,
                start: row.start,
                end: row.end,
                lengthBp: row.lengthBp,
                lengthAa: row.lengthAa,
                protein: row.protein,
                top_hit: row.top_hit,
                function: row.function,
                e_value: row.e_value
            }));

            displayResults(orfs, true); // true = isLoadedData
            resultsSection.classList.remove('hidden');
            revCompSection.classList.add('hidden');

            alert(`Loaded Task: ${currentTaskId}`);

        } catch (err) {
            console.error(err);
            alert("Failed to load task: " + err.message);
        } finally {
            loadBtn.disabled = false;
            loadBtn.textContent = "Load History";
        }
    });

    revCompBtn.addEventListener('click', () => {
        const sequence = getCleanSequence();
        if (!sequence) return;

        const revComp = getReverseComplement(sequence);
        revCompOutput.value = revComp;
        revCompSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    });

    function getCleanSequence() {
        const raw = sequenceInput.value.trim();
        if (!raw) {
            alert('Please enter a nucleotide sequence.');
            return null;
        }
        return raw.replace(/\s/g, '').toUpperCase();
    }

    function findAllORFs(sequence, minLength) {
        const orfs = [];
        const revSequence = getReverseComplement(sequence);
        const seqLen = sequence.length;

        for (let frame = 0; frame < 3; frame++) {
            orfs.push(...findORFsInFrame(sequence, frame, minLength, frame + 1, '+', seqLen));
        }

        for (let frame = 0; frame < 3; frame++) {
            orfs.push(...findORFsInFrame(revSequence, frame, minLength, -(frame + 1), '-', seqLen));
        }

        return orfs;
    }

    function findORFsInFrame(sequence, frame, minLength, frameLabel, strand, originalSeqLen) {
        const found = [];
        const seqLen = sequence.length;
        let start = -1;

        for (let i = frame; i < seqLen - 2; i += 3) {
            const codon = sequence.substring(i, i + 3);

            if (start === -1) {
                if (codon === 'ATG') {
                    start = i;
                }
            } else {
                if (['TAA', 'TAG', 'TGA'].includes(codon)) {
                    const end = i + 2;
                    const length = end - start + 1;

                    if (length >= minLength) {
                        const dnaSeq = sequence.substring(start, end + 1);

                        let startCoord = start + 1;
                        let endCoord = end + 1;

                        if (strand === '-') {
                            const oldStart = startCoord;
                            const oldEnd = endCoord;
                            startCoord = originalSeqLen - oldEnd + 1;
                            endCoord = originalSeqLen - oldStart + 1;
                        }

                        found.push({
                            strand: strand,
                            frame: frameLabel,
                            start: startCoord,
                            end: endCoord,
                            lengthBp: length,
                            lengthAa: length / 3,
                            protein: translate(dnaSeq)
                        });
                    }
                    start = -1;
                }
            }
        }
        return found;
    }

    function getReverseComplement(seq) {
        const complement = {
            'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C',
            'N': 'N'
        };
        return seq.split('').reverse().map(base => complement[base] || base).join('');
    }

    function translate(dna) {
        const codonTable = {
            'ATA': 'I', 'ATC': 'I', 'ATT': 'I', 'ATG': 'M',
            'ACA': 'T', 'ACC': 'T', 'ACG': 'T', 'ACT': 'T',
            'AAC': 'N', 'AAT': 'N', 'AAA': 'K', 'AAG': 'K',
            'AGC': 'S', 'AGT': 'S', 'AGA': 'R', 'AGG': 'R',
            'CTA': 'L', 'CTC': 'L', 'CTG': 'L', 'CTT': 'L',
            'CCA': 'P', 'CCC': 'P', 'CCG': 'P', 'CCT': 'P',
            'CAC': 'H', 'CAT': 'H', 'CAA': 'Q', 'CAG': 'Q',
            'CGA': 'R', 'CGC': 'R', 'CGG': 'R', 'CGT': 'R',
            'GTA': 'V', 'GTC': 'V', 'GTG': 'V', 'GTT': 'V',
            'GCA': 'A', 'GCC': 'A', 'GCG': 'A', 'GCT': 'A',
            'GAC': 'D', 'GAT': 'D', 'GAA': 'E', 'GAG': 'E',
            'GGA': 'G', 'GGC': 'G', 'GGG': 'G', 'GGT': 'G',
            'TCA': 'S', 'TCC': 'S', 'TCG': 'S', 'TCT': 'S',
            'TTC': 'F', 'TTT': 'F', 'TTA': 'L', 'TTG': 'L',
            'TAC': 'Y', 'TAT': 'Y', 'TAA': '*', 'TAG': '*',
            'TGC': 'C', 'TGT': 'C', 'TGA': '*', 'TGG': 'W',
        };

        let protein = "";
        for (let i = 0; i < dna.length; i += 3) {
            const codon = dna.substring(i, i + 3);
            protein += codonTable[codon] || '?';
        }
        return protein;
    }

    function displayResults(orfs, isLoadedData = false) {
        resultsSection.classList.remove('hidden');
        resultsTableBody.innerHTML = '';
        summaryDiv.textContent = `Found ${orfs.length} ORFs. Task ID: ${currentTaskId}`;

        if (orfs.length === 0) {
            resultsTableBody.innerHTML = '<tr><td colspan="11" style="text-align:center;">No ORFs found matching criteria.</td></tr>';
            return;
        }

        orfs.forEach((orf, index) => {
            const orfNumber = index + 1;
            const row = document.createElement('tr');

            // If loaded data, populate homology/function
            let homologyContent = '<span class="status-text">Ready</span>';
            let functionContent = '';

            if (isLoadedData) {
                if (orf.top_hit) {
                    homologyContent = `<strong>${orf.top_hit}</strong><br><small>E-value: ${orf.e_value}</small>`;
                    functionContent = `<div class="function-text" title="${orf.function}">${orf.function}</div>`;
                } else {
                    homologyContent = '<span class="status-text">Not Checked</span>';
                }
            }

            row.innerHTML = `
                <td><input type="checkbox" class="orf-checkbox" data-index="${index}"></td>
                <td>${orfNumber}</td>
                <td>${orf.strand}</td>
                <td>${orf.frame}</td>
                <td>${orf.start}</td>
                <td>${orf.end}</td>
                <td>${orf.lengthBp}</td>
                <td>${orf.lengthAa}</td>
                <td class="sequence-cell" title="${orf.protein}">${orf.protein}</td>
                <td class="homology-cell">${homologyContent}</td>
                <td class="function-cell">${functionContent}</td>
            `;
            resultsTableBody.appendChild(row);
        });

        // Reset Select All
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.onclick = () => {
                const checkboxes = document.querySelectorAll('.orf-checkbox');
                checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
            };
        }

        // Bind Run Buttons
        if (runSelectedBtn) runSelectedBtn.onclick = () => runHomologyChecks(orfs, true);
        if (runAllBtn) runAllBtn.onclick = () => runHomologyChecks(orfs, false);
    }

    async function runHomologyChecks(orfs, onlySelected) {
        const checkboxes = document.querySelectorAll('.orf-checkbox');
        const indicesToRun = [];

        checkboxes.forEach((cb, index) => {
            if (!onlySelected || cb.checked) {
                // Only run if not already checked or if user wants to re-run? 
                // Let's assume re-run is allowed.
                indicesToRun.push(index);
            }
        });

        if (indicesToRun.length === 0) {
            alert("No ORFs selected.");
            return;
        }

        runSelectedBtn.disabled = true;
        runAllBtn.disabled = true;

        // 1. Mark all as Waiting
        indicesToRun.forEach(index => {
            const row = resultsTableBody.children[index];
            const statusCell = row.querySelector('.homology-cell');
            statusCell.textContent = "Waiting...";
            statusCell.style.color = "gray";
        });

        // 2. Process sequentially to avoid NCBI rate limits
        const CONCURRENCY_LIMIT = 1;
        const queue = [...indicesToRun];
        const activePromises = [];

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const processItem = async (index) => {
            const orf = orfs[index];
            const row = resultsTableBody.children[index];
            const statusCell = row.querySelector('.homology-cell');
            const functionCell = row.querySelector('.function-cell');

            statusCell.textContent = "Checking...";
            statusCell.style.color = "blue";

            try {
                const response = await fetch('http://localhost:5000/blast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sequence: orf.protein,
                        task_id: currentTaskId,
                        orf_number: index + 1
                    })
                });

                if (!response.ok) {
                    throw new Error('Server error');
                }

                const data = await response.json();

                if (data.error) {
                    statusCell.textContent = 'Error: ' + data.error;
                    statusCell.style.color = 'red';
                } else {
                    statusCell.innerHTML = `<strong>${data.top_hit}</strong><br><small>E-value: ${data.e_value}</small>`;
                    statusCell.style.color = "black";
                    functionCell.innerHTML = `<div class="function-text" title="${data.function}">${data.function}</div>`;
                }

            } catch (err) {
                console.error(err);
                statusCell.textContent = 'Failed';
                statusCell.style.color = 'red';
            }
        };

        while (queue.length > 0 || activePromises.length > 0) {
            while (queue.length > 0 && activePromises.length < CONCURRENCY_LIMIT) {
                const index = queue.shift();
                const promise = processItem(index).then(async () => {
                    activePromises.splice(activePromises.indexOf(promise), 1);
                    // Add delay after each request to be polite to NCBI
                    await sleep(3000);
                });
                activePromises.push(promise);
            }

            if (activePromises.length > 0) {
                await Promise.race(activePromises);
            }
        }

        runSelectedBtn.disabled = false;
        runAllBtn.disabled = false;
        alert("Homology checks completed.");
    }
});

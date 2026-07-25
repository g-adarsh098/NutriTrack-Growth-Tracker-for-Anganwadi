let globalMeasurements = [];

function setUIState(state) {
    document.getElementById('loadingState').style.display = state === 'loading' ? 'flex' : 'none';
    document.getElementById('errorState').style.display = state === 'error' ? 'flex' : 'none';
    document.getElementById('emptyState').style.display = state === 'empty' ? 'flex' : 'none';
    document.getElementById('dataTable').style.display = state === 'data' ? 'table' : 'none';
}

async function loadData() {
    setUIState('loading');
    
    try {
        const response = await fetch('http://localhost:3000/api/measurements');
        
        if (!response.ok) {
            throw new Error('Server rejected the request');
        }

        globalMeasurements = await response.json();
        
        const now = new Date();
        document.getElementById('lastUpdatedTime').innerText = `Last Updated: ${now.toLocaleTimeString()}`;
        
        if (globalMeasurements.length === 0) {
            document.getElementById('emptyStateMessage').innerText = "The database is empty. Add a new record to get started.";
            setUIState('empty');
        } else {
            setUIState('data');
            renderTable(globalMeasurements);
        }
    } catch (error) {
        setUIState('error');
    }
}

function renderTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        let statusClass = '';
        if (row.status === 'Normal') statusClass = 'status-normal';
        if (row.status === 'Underweight') statusClass = 'status-underweight';
        if (row.status === 'MAM') statusClass = 'status-mam';
        if (row.status === 'SAM') statusClass = 'status-sam';

        const rowDataStr = encodeURIComponent(JSON.stringify(row));

        tr.innerHTML = `
            <td>${row.record_id}</td>
            <td>${row.child_name}</td>
            <td>${row.age_months}</td>
            <td>${row.weight_kg !== null ? row.weight_kg : ''}</td>
            <td class="${statusClass}">${row.status}</td>
            <td><button onclick="editRecord('${rowDataStr}')">Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadData() {
    // Show the small inner table spinner just in case the app is already loaded
    // and the user is refreshing the data by adding a new record.
    setUIState('loading'); 
    
    try {
        const response = await fetch('http://localhost:3000/api/measurements');
        
        if (!response.ok) {
            throw new Error('Server rejected the request');
        }

        globalMeasurements = await response.json();
        
        // Data successfully retrieved! Hide the full-page NutriTrack loader
        const appLoader = document.getElementById('appLoader');
        if (appLoader) {
            appLoader.style.opacity = '0';
            setTimeout(() => {
                appLoader.style.visibility = 'hidden';
                appLoader.style.display = 'none';
            }, 500);
        }
        
        const now = new Date();
        document.getElementById('lastUpdatedTime').innerText = `Last Updated: ${now.toLocaleTimeString()}`;
        
        if (globalMeasurements.length === 0) {
            document.getElementById('emptyStateMessage').innerText = "The database is empty. Add a new record to get started.";
            setUIState('empty');
        } else {
            setUIState('data');
            renderTable(globalMeasurements);
        }
    } catch (error) {
        // Database connection failed. Hide the full-page loader immediately 
        // so the user can see the regular error screen.
        const appLoader = document.getElementById('appLoader');
        if (appLoader) {
            appLoader.style.display = 'none';
        }
        
        setUIState('error');
    }
}

function filterData() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const statusVal = document.getElementById('statusFilter').value;

    const filteredData = globalMeasurements.filter(row => {
        const rowText = `${row.record_id} ${row.child_name}`.toLowerCase();
        const matchSearch = rowText.includes(searchVal);
        const matchStatus = statusVal === 'All' || row.status === statusVal;
        
        return matchSearch && matchStatus;
    });

    if (filteredData.length === 0) {
        document.getElementById('emptyStateMessage').innerText = "No records match your current search or filter.";
        setUIState('empty');
    } else {
        setUIState('data');
        renderTable(filteredData);
    }
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'All';
    filterData();
}

function openModal() {
    document.getElementById('measurementForm').reset();
    document.getElementById('formError').style.display = 'none';
    document.getElementById('dataModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('dataModal').style.display = 'none';
}

function editRecord(rowDataStr) {
    const row = JSON.parse(decodeURIComponent(rowDataStr));
    document.getElementById('record_id').value = row.record_id;
    document.getElementById('child_name').value = row.child_name;
    document.getElementById('age_months').value = row.age_months;
    document.getElementById('weight_kg').value = row.weight_kg;
    document.getElementById('height_cm').value = row.height_cm;
    
    document.getElementById('formError').style.display = 'none';
    document.getElementById('dataModal').style.display = 'flex';
}

async function submitForm(e) {
    e.preventDefault();
    
    const saveButton = document.getElementById('saveButton');
    saveButton.disabled = true;
    saveButton.innerText = "Saving...";
    document.getElementById('formError').style.display = 'none';
    
    const payload = {
        record_id: document.getElementById('record_id').value,
        child_name: document.getElementById('child_name').value,
        age_months: parseInt(document.getElementById('age_months').value),
        weight_kg: parseFloat(document.getElementById('weight_kg').value) || null,
        height_cm: parseFloat(document.getElementById('height_cm').value) || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/measurements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            const errorDiv = document.getElementById('formError');
            errorDiv.innerHTML = `❌ Invalid Data: ${result.error}`;
            errorDiv.style.display = 'block';
            saveButton.disabled = false;
            saveButton.innerText = "Save Data";
        } else {
            closeModal();
            saveButton.disabled = false;
            saveButton.innerText = "Save Data";
            loadData();
        }
    } catch (error) {
        const errorDiv = document.getElementById('formError');
        errorDiv.innerHTML = `❌ Network Error: Could not save to server. Check your connection and try again.`;
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        saveButton.innerText = "Save Data";
    }
}

window.onload = loadData;
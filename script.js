document.addEventListener('DOMContentLoaded', function() {
  // List of all tables you want to manage
  const tables = [
    { name: 'BOOKS', display: 'Books', primaryKey: 'Bid' },
    { name: 'STUDENT', display: 'Students', primaryKey: 'Stid' },
    { name: 'STAFF', display: 'Staff', primaryKey: 'Staid' },
    { name: 'DEPARTMENT', display: 'Departments', primaryKey: 'Deptid' },
    { name: 'Ilibrary', display: 'Libraries', primaryKey: 'Lid' },
    { name: 'AUTHOR', display: 'Authors', primaryKey: 'Aid' },
    { name: 'PUBLISHER', display: 'Publishers', primaryKey: 'Pid' },
    { name: 'WRITES', display: 'Writes', primaryKey: 'Wid' },
    { name: 'SELLER', display: 'Sellers', primaryKey: 'Sid' },
    { name: 'PURCHASE', display: 'Purchases', primaryKey: 'Purchaseid' },
    { name: 'AUTHOR_SPECIALIZATION', display: 'Author Specializations', primaryKey: 'ASid' },
    { name: 'ISSUE', display: 'Issues', primaryKey: 'Issueid' },
    { name: 'SELLS', display: 'Sells', primaryKey: 'Sellsid' },
    { name: 'EMPLOYEE', display: 'Employees', primaryKey: 'Eid' },
    // Add all other tables here
  ];

  // Generate tabs
  const tabContainer = document.getElementById('tableTabs');
  tables.forEach((table, index) => {
    const tab = document.createElement('button');
    tab.className = `tab-btn ${index === 0 ? 'active' : ''}`;
    tab.textContent = table.display;
    tab.dataset.table = table.name;
    tab.addEventListener('click', () => loadTableData(table.name));
    tabContainer.appendChild(tab);
  });

  // Load first table by default
  if (tables.length > 0) {
    loadTableData(tables[0].name);
  }

  // Modal close button
  document.querySelector('#dataModal .close').addEventListener('click', () => {
    document.getElementById('dataModal').style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('dataModal')) {
      document.getElementById('dataModal').style.display = 'none';
    }
  });

  // Form submission
  document.getElementById('dataForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const tableName = form.dataset.currentTable;
    const recordId = document.getElementById('recordId').value;

    // Collect form data
    const formData = {};
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.id !== 'recordId') {
        formData[input.name] = input.value;
      }
    });

    try {
      if (recordId) {
        // Update existing record
        await fetch(`/api/tables/${tableName}/${recordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Add new record
        await fetch(`/api/tables/${tableName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      document.getElementById('dataModal').style.display = 'none';
      loadTableData(tableName);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record');
    }
  });
});

async function loadTableData(tableName) {
  try {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.table === tableName);
    });

    // Fetch data
    const response = await fetch(`/api/tables/${tableName}`);
    const data = await response.json();

    // Create table
    const contentDiv = document.getElementById('tableContent');
    contentDiv.innerHTML = `
      <h2>${tableName} Management</h2>
      <button class="add-btn" data-table="${tableName}">Add New</button>
      <div class="table-container">
        <table id="dataTable">
          <thead>
            <tr id="tableHeaders"></tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    `;

    // Add headers
    const headersRow = document.getElementById('tableHeaders');
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headersRow.appendChild(th);
      });
      // Add actions header
      const actionsTh = document.createElement('th');
      actionsTh.textContent = 'Actions';
      headersRow.appendChild(actionsTh);
    }

    // Add rows
    const tbody = document.getElementById('tableBody');
    data.forEach(item => {
      const row = document.createElement('tr');
      Object.values(item).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value !== null ? value : 'NULL';
        row.appendChild(td);
      });

      // Add action buttons
      const actionsTd = document.createElement('td');
      const primaryKey = Object.keys(item).find(key => key.toLowerCase().includes('id'));
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.dataset.id = item[primaryKey];
      editBtn.dataset.table = tableName;
      editBtn.addEventListener('click', () => openEditModal(tableName, item[primaryKey]));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.id = item[primaryKey];
      deleteBtn.dataset.table = tableName;
      deleteBtn.addEventListener('click', () => deleteRecord(tableName, item[primaryKey]));

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);
      row.appendChild(actionsTd);
      tbody.appendChild(row);
    });

    // Add button event listener
    document.querySelector('.add-btn').addEventListener('click', () => openAddModal(tableName));

  } catch (error) {
    console.error('Error loading table data:', error);
    alert('Failed to load data');
  }
}

async function openAddModal(tableName) {
  try {
    // Fetch one record to get the structure (columns)
    const response = await fetch(`/api/tables/${tableName}?limit=1`);
    const [sampleData] = await response.json();

    document.getElementById('modalTitle').textContent = `Add New ${tableName}`;
    document.getElementById('recordId').value = '';
    document.getElementById('dataForm').dataset.currentTable = tableName;

    // Generate form fields
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    if (sampleData) {
      Object.keys(sampleData).forEach(key => {
        // Skip auto-increment IDs
        if (key.toLowerCase().includes('id') && sampleData[key] === null) return;

        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = `${key}:`;
        label.htmlFor = key;

        let input;
        if (typeof sampleData[key] === 'number') {
          input = document.createElement('input');
          input.type = 'number';
          input.step = 'any';
        } else {
          input = document.createElement('input');
          input.type = 'text';
        }

        input.id = key;
        input.name = key;

        div.appendChild(label);
        div.appendChild(input);
        formFields.appendChild(div);
      });
    }

    document.getElementById('dataModal').style.display = 'block';
  } catch (error) {
    console.error('Error preparing add form:', error);
    alert('Failed to prepare form');
  }
}

async function openEditModal(tableName, id) {
  try {
    const response = await fetch(`/api/tables/${tableName}/${id}`);
    const data = await response.json();

    document.getElementById('modalTitle').textContent = `Edit ${tableName}`;
    document.getElementById('recordId').value = id;
    document.getElementById('dataForm').dataset.currentTable = tableName;

    // Generate form fields with values
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    Object.keys(data).forEach(key => {
      // Skip primary key field (we have it in the hidden input)
      if (key.toLowerCase().includes('id')) return;

      const div = document.createElement('div');
      const label = document.createElement('label');
      label.textContent = `${key}:`;
      label.htmlFor = key;

      let input;
      if (typeof data[key] === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }

      input.id = key;
      input.name = key;
      input.value = data[key] !== null ? data[key] : '';

      div.appendChild(label);
      div.appendChild(input);
      formFields.appendChild(div);
    });

    document.getElementById('dataModal').style.display = 'block';
  } catch (error) {
    console.error('Error preparing edit form:', error);
    alert('Failed to load record for editing');
  }
}

async function deleteRecord(tableName, id) {
  if (confirm(`Are you sure you want to delete this record from ${tableName}?`)) {
    try {
      await fetch(`/api/tables/${tableName}/${id}`, { method: 'DELETE' });
      loadTableData(tableName);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record');
    }
  }
}

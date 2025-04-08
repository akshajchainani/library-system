// Global state
let currentTable = '';
let tableSchema = {}; // Stores schema { tableName: [col1, col2,...] }
let currentUserRole = null; // 'admin' or 'user' or null
let allBooks = []; // Cache for book browsing

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

function checkLoginStatus() {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        currentUserRole = sessionStorage.getItem('userRole') || 'user'; // Default to user if role missing
        showMainContent();
    } else {
        currentUserRole = null;
        showLogin();
    }
}

function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('loginError');
    const username = usernameInput.value;
    const password = passwordInput.value;

    let loggedIn = false;
    let role = null;

    if (username === 'admin' && password === 'admin123') {
        loggedIn = true;
        role = 'admin';
    } else if (username === 'user' && password === 'user123') {
        loggedIn = true;
        role = 'user';
    }

    if (loggedIn) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        sessionStorage.setItem('userRole', role);
        currentUserRole = role;
        showMainContent();
        errorMsg.style.display = 'none';
    } else {
        errorMsg.style.display = 'block';
        currentUserRole = null;
        usernameInput.focus();
    }
}

function handleLogout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    sessionStorage.removeItem('userRole');
    currentUserRole = null;
    allBooks = []; // Clear book cache on logout
    // Clear listener flags when logging out
    document.querySelectorAll('#mainNavLinks .nav-link').forEach(link => {
        link.removeAttribute('data-listener-added');
    });
    document.querySelectorAll('#userNavLinks .nav-link').forEach(link => { // Also clear user nav listeners
        link.removeAttribute('data-listener-added');
    });
    showLogin();
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('mainNavLinks').style.display = 'none';
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

function showMainContent() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    populateNavbar(); // Sets up nav based on role
    document.getElementById('mainNavLinks').style.display = 'flex'; 

    // Display correct view (Admin or User)
    if (currentUserRole === 'admin') {
        document.getElementById('adminView').style.display = 'block';
        document.getElementById('userView').style.display = 'none';
        initializeAdminView();
    } else if (currentUserRole === 'user') {
        document.getElementById('adminView').style.display = 'none';
        document.getElementById('userView').style.display = 'block';
        initializeUserView();
    }
}

function populateNavbar() {
    const navLinksContainer = document.getElementById('mainNavLinks');
    navLinksContainer.innerHTML = ''; // Clear existing links

    let navItems = [];
    if (currentUserRole === 'admin') {
        navItems = [
            { text: 'Home', section: 'homeSection' },
            { text: 'TABLES', section: 'tablesSection' },
            { text: 'Queries', section: 'querySection' }
        ];
    } else if (currentUserRole === 'user') {
        navItems = [
            { text: 'Welcome', section: 'userWelcomeSection' },
            { text: 'Browse Books', section: 'userHomeSection' }
        ];
    }

    // Add role-specific links
    navItems.forEach(item => {
        const button = document.createElement('button');
        button.className = 'nav-link';
        button.dataset.section = item.section;
        button.textContent = item.text;
        navLinksContainer.appendChild(button);
    });

    // Add Logout button for all roles
    const logoutButton = document.createElement('button');
    logoutButton.className = 'nav-link logout-btn';
    logoutButton.onclick = handleLogout;
    logoutButton.textContent = 'Logout';
    navLinksContainer.appendChild(logoutButton);

    // Re-initialize navigation listeners for the newly created buttons
    initializeNavigation(currentUserRole);
}

function initializeAdminView() {
    // Initialize components for the admin view
    setupQueryInterface('admin');
    loadTables(); 
    navigateToSection('homeSection'); // Start admin at their home
}

function initializeUserView() {
    // Initialize components for the user view
    loadBooksForBrowsing(); // Load books 
    navigateToSection('userWelcomeSection'); // Start user at welcome
}

// applyRolePermissions can be removed or simplified as specific views handle their content
function applyRolePermissions() {
   // console.log("Applying permissions for role:", currentUserRole);
   // Specific UI elements are now handled within their respective views/functions
}

// Navigation handling (Adjusted for dynamic links)
function initializeNavigation(role) {
    const navContainerId = 'mainNavLinks'; 
    const navLinks = document.querySelectorAll(`#${navContainerId} .nav-link:not(.logout-btn)`);
    
    navLinks.forEach(link => {
        const newLink = link.cloneNode(true); 
        link.parentNode.replaceChild(newLink, link);
    });

    const newNavLinks = document.querySelectorAll(`#${navContainerId} .nav-link:not(.logout-btn)`);
    newNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetSectionId = link.getAttribute('data-section');
            // Determine view based on role, as nav is shared
            const targetViewContainerId = currentUserRole === 'admin' ? 'adminView' : 'userView';
            navigateToSection(targetSectionId, targetViewContainerId);
        });
    });
}

function navigateToSection(sectionId, viewContainerId = null) {
    const currentViewId = viewContainerId || (currentUserRole === 'admin' ? 'adminView' : 'userView');
    const navContainerId = 'mainNavLinks';

    // Update nav active state
    document.querySelectorAll(`#${navContainerId} .nav-link:not(.logout-btn)`).forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });

    // Hide all sections in both views first
    document.querySelectorAll('#adminView .section, #userView .section').forEach(section => {
        section.classList.remove('active');
    });
    // Show target section within the specific view container
    const targetSection = document.querySelector(`#${currentViewId} #${sectionId}`);
    if (targetSection) {
         targetSection.classList.add('active');
    } else {
        console.error(`Target section #${sectionId} not found in view #${currentViewId}`);
        // Optionally navigate to a default section like the view's home
        const defaultSectionId = currentViewId === 'adminView' ? 'homeSection' : 'userWelcomeSection';
        document.querySelector(`#${currentViewId} #${defaultSectionId}`)?.classList.add('active');
        // Also update the nav active state to reflect the default
         document.querySelectorAll(`#${navContainerId} .nav-link:not(.logout-btn)`).forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === defaultSectionId);
         });
    }
}

// Load tables (Admin only - called from initializeAdminView)
async function loadTables() {
    if (currentUserRole !== 'admin') return;
    const tableGrid = document.getElementById('tableGrid');
    const tables = [
        { name: 'SIULIBRARY', description: 'Main library information' },
        { name: 'Ilibrary', description: 'Institute libraries' },
        { name: 'BOOKS', description: 'Book information' },
        { name: 'Noofcopies', description: 'Book copies information' },
        { name: 'AUTHOR', description: 'Author information' },
        { name: 'Writes', description: 'Author-book relationships' },
        { name: 'PUBLISHER', description: 'Publisher information' },
        { name: 'SELLER', description: 'Seller information' },
        { name: 'DEPARTMENT', description: 'Department information' },
        { name: 'STUDENT', description: 'Student information' },
        { name: 'STAFF', description: 'Staff information' },
        { name: 'PURCHASE', description: 'Purchase information' },
        { name: 'ISSUE', description: 'Book issue information' },
        { name: 'SELLS', description: 'Seller-book relationships' },
        { name: 'Employee', description: 'Employee information' },
        { name: 'A_specialization', description: 'Author specialization' },
        { name: 'Member', description: 'Member information' }
    ];

    tableGrid.innerHTML = '';
    tables.forEach(table => {
        const tableCard = document.createElement('div');
        tableCard.className = 'table-card';
        let actionsHtml = `
            <button onclick="viewTable('${table.name}')" class="view-btn">
                <span class="material-icons">visibility</span> View
            </button>
        `;
        // Only show Add button for admin
        if (currentUserRole === 'admin') {
            actionsHtml += `
                <button onclick="showAddRecordForm('${table.name}')" class="add-record-btn">
                    <span class="material-icons">add</span> Add
                </button>
            `;
        }
        tableCard.innerHTML = `
            <h3>${table.name}</h3>
            <p>${table.description}</p>
            <div class="table-actions">
                ${actionsHtml}
            </div>
        `;
        tableGrid.appendChild(tableCard);
    });
}

// --- User Book Browsing ---
async function loadBooksForBrowsing() {
    if (currentUserRole !== 'user') return;
    const bookGrid = document.getElementById('bookGrid');
    bookGrid.innerHTML = '<p>Loading books...</p>';
    try {
        const data = await fetchWithRole('/api/books/browse'); // Error caught by fetchWithRole
        allBooks = data || []; // Assign fetched data or empty array
        displayBooks(allBooks);
    } catch (error) { // Catch error re-thrown by fetchWithRole
        console.error('Error loading books for browsing:', error);
        bookGrid.innerHTML = `<p class="error">Error loading books: ${error.message}</p>`;
        allBooks = [];
    }
}

function displayBooks(books) {
    const bookGrid = document.getElementById('bookGrid');
    bookGrid.innerHTML = '';
    if (!Array.isArray(books) || books.length === 0) {
        bookGrid.innerHTML = '<p>No books found.</p>';
        return;
    }
    console.log("Books data received:", books); // Log the whole array
    books.forEach(book => {
        console.log("Processing book:", book); // Log each book object
        console.log("Book Bid:", book.Bid, "Type:", typeof book.Bid); // Log Bid and its type

        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        const isAvailable = true; // Placeholder
        const availabilityClass = isAvailable ? 'available' : 'unavailable';

        // Safely format the price
        let formattedPrice = 'N/A';
        if (book.Price !== null && book.Price !== undefined) {
            const priceNumber = parseFloat(book.Price);
            if (!isNaN(priceNumber)) {
                formattedPrice = `$${priceNumber.toFixed(2)}`;
            }
        }

        bookCard.innerHTML = `
            <h4>${book.Title || 'N/A'}</h4>
            <p>Library ID: ${book.Lid || 'N/A'}</p>
            <p class="price">Price: ${formattedPrice}</p>
            <div class="book-actions">
                 <button class="issue-btn" onclick="promptIssueDates('${book.Bid}')" ${!isAvailable ? 'disabled' : ''}>
                     <span class="material-icons">book</span> Issue
                 </button>
            </div>
            <div class="availability ${availabilityClass}">${isAvailable ? 'Available' : 'Checked Out'}</div>
        `;
        bookGrid.appendChild(bookCard);
    });
}

function filterBooks() {
    const searchTerm = document.getElementById('bookSearchInput').value.toLowerCase();
    const filteredBooks = allBooks.filter(book => 
        (book.Title && book.Title.toLowerCase().includes(searchTerm)) ||
        (book.Author && book.Author.toLowerCase().includes(searchTerm)) ||
        (book.Category && book.Category.toLowerCase().includes(searchTerm))
    );
    displayBooks(filteredBooks);
}
// --- End User Book Browsing ---

// Query Interface Setup (Adjusted for Roles)
function setupQueryInterface(role) {
    const isAdmin = role === 'admin';
    const selectorId = isAdmin ? 'querySelector' : 'userQuerySelector';
    const buttonId = isAdmin ? 'executeQueryBtn' : 'userExecuteQueryBtn';
    const descriptionId = isAdmin ? 'queryDescription' : 'userQueryDescription';
    
    const querySelector = document.getElementById(selectorId);
    const executeQueryBtn = document.getElementById(buttonId);
    const queryDescription = document.getElementById(descriptionId);
    
    const allQueryOptions = {
        1: "1. Libraries in Pune",
        2: "2. CS Department Institute",
        3: "3. Books Price Range (800-12000)",
        4: "4. Employees Salary ≤ 50000",
        5: "5. Sellers Name Ending with \"ta\"",
        6: "6. Libraries with Missing Area",
        7: "7. Staff Not Starting with \"A\"",
        8: "8. Libraries in Bangalore",
        9: "9. Civil Department Students",
        10: "10. Delete 2016 Purchases" // Admin only
    };

    const queryDescriptions = {
        1: "Find institute libraries that are located in Pune city",
        // ... other descriptions ...
        10: "Delete purchase details from the year 2016 (Admin Only)"
    };

    // Populate dropdown based on role
    querySelector.innerHTML = '<option value="" disabled selected>Choose a query...</option>';
    for (const [id, title] of Object.entries(allQueryOptions)) {
        if (id === '10' && !isAdmin) continue; // Skip delete query for user
        const option = document.createElement('option');
        option.value = id;
        option.textContent = title;
        querySelector.appendChild(option);
    }

    querySelector.addEventListener('change', function() {
        const selectedQuery = this.value;
        executeQueryBtn.disabled = !selectedQuery;
        queryDescription.textContent = selectedQuery ? queryDescriptions[selectedQuery] : '';
    });
}

// Execute Query (Adjusted for Roles)
async function executeSelectedQuery() {
    const isAdmin = currentUserRole === 'admin'; 
    const selectorId = isAdmin ? 'querySelector' : 'userQuerySelector';
    const resultId = isAdmin ? 'queryResult' : 'userQueryResult';
    const querySelector = document.getElementById(selectorId);
    const queryResultElement = document.getElementById(resultId);
    const selectedQuery = querySelector.value;
    
    if (!queryResultElement) {
        console.error("Query result element not found:", resultId);
        return;
    }
    if (!selectedQuery) {
        console.log("No query selected.");
        return;
    }
    
    console.log(`Attempting to execute query ID ${selectedQuery} for role ${currentUserRole}. Target result area: #${resultId}`);
    queryResultElement.innerHTML = '<p>Executing query...</p>'; 

    if (selectedQuery === '10' && !isAdmin) { 
        console.warn("User attempted to run admin-only query (ID 10).");
        queryResultElement.innerHTML = `<p class="error">This query requires admin privileges.</p>`;
        return; 
    }
    
    try {
        console.log(`Fetching: /api/execute-query/${selectedQuery}`);
        const data = await fetchWithRole(`/api/execute-query/${selectedQuery}`); 
        console.log(`Query ${selectedQuery} raw data received:`, data); // Log raw response

        // Check if data is an array (expected for SELECT) or has affectedRows (for DELETE)
        const isDeleteSuccess = selectedQuery === '10' && data && data.affectedRows > 0;
        const isSelectResult = Array.isArray(data);

        if (selectedQuery === '10') {
             if (isDeleteSuccess) {
                 queryResultElement.innerHTML = `<p class="success">Successfully deleted purchase records from 2016.</p>`;
             } else {
                 // Log the actual response if delete didn't report success
                 console.warn('DELETE query response did not indicate success:', data);
                 queryResultElement.innerHTML = `<p class="error">Failed to delete records, or no records found to delete.</p>`;
             }
             return;
        }
        
        if (!isSelectResult || data.length === 0) {
             console.log(`Query ${selectedQuery} resulted in no data or unexpected format.`);
            queryResultElement.innerHTML = '<p>No results found</p>';
            return;
        }

        console.log(`Query ${selectedQuery} rendering data table...`);
        const table = createDataTable(data);
        queryResultElement.innerHTML = ''; 
        queryResultElement.appendChild(table); 
        console.log(`Query ${selectedQuery} finished successfully.`);

    } catch (error) {
        // Error already logged by fetchWithRole
        console.error(`Error caught during execution/display of query ${selectedQuery}:`, error);
        queryResultElement.innerHTML = `<p class="error">Error executing query: ${error.message}</p>`;
    }
}

// Wrapper for fetch to include role header (INSECURE DEMO METHOD)
async function fetchWithRole(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (currentUserRole) {
        headers['X-User-Role'] = currentUserRole; 
    }
    // Add cache-busting header to try and prevent stale data issues
    headers['Cache-Control'] = 'no-cache';
    headers['Pragma'] = 'no-cache';
    
    try {
        const response = await fetch(url, { ...options, headers });
        // Check for non-OK response status early
        if (!response.ok) {
            let errorData = { error: `HTTP error! Status: ${response.status}` };
            try {
                // Try parsing JSON error from backend
                 errorData = await response.json();
            } catch (e) { 
                // Ignore if response body isn't JSON 
            }
            // Throw an error object compatible with later catch blocks
             throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
         // Check content type before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json(); // Return parsed JSON
        } else {
            return await response.text(); // Return text for non-JSON responses
        }
    } catch (error) {
        console.error('Fetch error:', error);
        // Re-throw the error to be caught by the calling function
        throw error;
    }
}

// --- View Table, CRUD operations (Role checks inside) ---
// View table data (Now fetches schema if needed)
async function viewTable(tableName) {
    if (currentUserRole !== 'admin') return;
    currentTable = tableName; // Set current table context
    
    const modal = document.getElementById('tableModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const addRecordButton = modal.querySelector('.add-record-btn');
    
    modalTitle.textContent = tableName;
    modalContent.innerHTML = '<p>Loading data...</p>'; // Show loading state
    modal.style.display = 'block';

    // Ensure schema is loaded *before* fetching data
    const schemaLoaded = await ensureSchema(tableName);
    if (!schemaLoaded) {
         modalContent.innerHTML = '<p class="error">Could not load table structure. Cannot display data or add records.</p>';
         if (addRecordButton) addRecordButton.style.display = 'none';
         setupModalClose(modal);
         return;
    }
    
    // Show/hide add button based on schema load and role (redundant role check, but safe)
    if (addRecordButton) {
         addRecordButton.style.display = (schemaLoaded && currentUserRole === 'admin') ? 'flex' : 'none';
    }
    
    try {
        const data = await fetchWithRole(`/api/table/${tableName}`);
        if (!Array.isArray(data)) {
             throw new Error('Invalid data format received');
        }

        if (data.length === 0) {
            modalContent.innerHTML = '<p>No data available in this table.</p>';
        } else {
            // Ensure schema matches data if somehow missed earlier
             if (!tableSchema[tableName] || tableSchema[tableName].length === 0) {
                  tableSchema[tableName] = Object.keys(data[0]);
             }
            const table = createDataTable(data);
            modalContent.innerHTML = '';
            modalContent.appendChild(table);
        }
    } catch (error) {
        console.error(`Error fetching data for table ${tableName}:`, error);
        modalContent.innerHTML = `<p class="error">Error loading table data: ${error.message}</p>`;
    }
    
    setupModalClose(modal);
}

function setupModalClose(modalElement) {
     const closeBtn = modalElement.querySelector('.close');
     if (closeBtn) {
          closeBtn.onclick = () => closeModal(modalElement.id);
     }
     // Close on outside click
     window.onclick = (event) => {
         if (event.target === modalElement) {
             closeModal(modalElement.id);
         }
     };
}

function createDataTable(data) {
    const isAdmin = currentUserRole === 'admin';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create header row
    const headerRow = document.createElement('tr');
      Object.keys(data[0] || {}).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });

    // Only add action column header for admin
    if (isAdmin && Object.keys(data[0] || {}).length > 0) {
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        headerRow.appendChild(actionTh);
    }
    
    thead.appendChild(headerRow);

    // Create data rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Add data cells
        Object.values(row).forEach(value => {
        const td = document.createElement('td');
            td.textContent = value ?? 'N/A';
            tr.appendChild(td);
      });

      // Only add action buttons for admin
        if (isAdmin) {
            const actionTd = document.createElement('td');
            actionTd.innerHTML = `
                <button onclick="editRecord('${currentTable}', ${JSON.stringify(row).replace(/"/g, '&quot;')})" class="edit-btn">
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteRecord('${currentTable}', ${JSON.stringify(row).replace(/"/g, '&quot;')})" class="delete-btn">
                    <span class="material-icons">delete</span>
                </button>
            `;
            tr.appendChild(actionTd);
        }
        
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

// Add record functionality
async function showAddRecordForm(tableName = currentTable) {
    if (currentUserRole !== 'admin') return;
    
    // Ensure schema is loaded before showing the form
    const schemaLoaded = await ensureSchema(tableName);
    if (!schemaLoaded || !tableSchema[tableName] || tableSchema[tableName].length === 0) {
        alert(`Cannot add record: Table structure for ${tableName} is not available.`);
        return;
    }

    // Reset form state before populating
    restoreAddRecordForm(); 
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = ''; // Clear previous fields

    tableSchema[tableName].forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        // Basic input type guessing (can be improved)
        let inputType = 'text';
        if (field.toLowerCase().includes('date')) {
             inputType = 'date';
        } else if (field.toLowerCase().includes('price') || field.toLowerCase().includes('salary') || field.toLowerCase().includes('id') || field.toLowerCase().includes('copies')) {
             inputType = 'number';
        }
        
        fieldDiv.innerHTML = `
            <label for="add-form-${field}">${field}:</label>
            <input type="${inputType}" id="add-form-${field}" name="${field}" required>
        `;
        formFields.appendChild(fieldDiv);
    });

    document.getElementById('addRecordModal').style.display = 'block';
    setupModalClose(document.getElementById('addRecordModal'));
}

// Handle Add Record Submission
async function handleAddRecord(event) {
    event.preventDefault();
    if (currentUserRole !== 'admin') return;

    const formData = {};
    let formIsValid = true; 
    if (!tableSchema[currentTable]) {
        alert("Cannot add record: table schema missing.");
        return;
    }
    tableSchema[currentTable].forEach(field => {
        const inputElement = document.getElementById(`add-form-${field}`);
        if (inputElement) {
             formData[field] = inputElement.value;
        } else {
             console.error(`Input element for field ${field} not found.`);
             formIsValid = false;
        }
    });

    if (!formIsValid) {
         alert("Form error. Please check console.");
         return;
    }

    console.log("Adding record:", formData);

    try {
        const result = await fetchWithRole(`/api/table/${currentTable}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        }); // Error handled by fetchWithRole

        console.log('Add result:', result);
        closeModal('addRecordModal');
        viewTable(currentTable); // Refresh the table view
        alert('Record added successfully!');
    } catch (error) {
        console.error('Error adding record:', error);
        alert(`Error adding record: ${error.message}`);
    }
}

// Edit functionality 
async function editRecord(tableName, record) {
    if (currentUserRole !== 'admin') return;
    
    // Ensure schema is loaded first
    const schemaLoaded = await ensureSchema(tableName);
    if (!schemaLoaded || !tableSchema[tableName] || tableSchema[tableName].length === 0) {
        alert(`Cannot edit record: Table structure for ${tableName} is not available.`);
        return;
    }
    
    // Find primary key (simple heuristic)
    const primaryKey = tableSchema[tableName].find(key => key.toLowerCase().includes('id')) || tableSchema[tableName][0];
    if (!record.hasOwnProperty(primaryKey)) {
        alert('Cannot edit record: Primary key not found in data.');
        return;
    }
    const primaryKeyValue = record[primaryKey];

    // Show and populate the form
    showAddRecordForm(tableName); // This ensures the form is built based on schema
    document.querySelector('#addRecordModal h2').textContent = `Edit Record in ${tableName}`;
    document.querySelector('#addRecordForm button[type="submit"]').textContent = 'Update Record';

    // Populate fields
    tableSchema[tableName].forEach(field => {
        const input = document.getElementById(`add-form-${field}`);
        if (input && record.hasOwnProperty(field)) {
            input.value = record[field] ?? '';
             // Disable editing the primary key field
            if (field === primaryKey) {
                 input.disabled = true;
                 input.style.backgroundColor = '#eee'; // Indicate disabled
            }
        }
    });

    // Change form submission to handle UPDATE
    const form = document.getElementById('addRecordForm');
    form.onsubmit = async (event) => {
        event.preventDefault();
        const updatedData = {};
        // Read data from form, excluding disabled PK
        tableSchema[tableName].forEach(field => {
            if (field !== primaryKey) { // Don't send PK in update body if API expects it separate
                updatedData[field] = document.getElementById(`add-form-${field}`).value;
            }
        });
         updatedData[primaryKey] = primaryKeyValue; // Add PK back for the WHERE clause in API

        console.log("Updating record:", updatedData);

        try {
            const result = await fetchWithRole(`/api/table/${tableName}`, {
                method: 'PUT', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedData) 
            }); // Error handled by fetchWithRole
            
            console.log('Update result:', result);
            closeModal('addRecordModal');
            viewTable(tableName); // Refresh
            alert('Record updated successfully!');
        } catch (error) {
            console.error('Error updating record:', error);
            alert(`Error updating record: ${error.message}`);
        }
        restoreAddRecordForm(); // Restore form state after submit attempt
    };
}

// Reset Add/Edit Form to its 'Add' state
function restoreAddRecordForm() {
     document.querySelector('#addRecordModal h2').textContent = 'Add New Record';
    const submitButton = document.querySelector('#addRecordForm button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Add Record';
    const form = document.getElementById('addRecordForm');
    if (form) form.onsubmit = handleAddRecord;
    // Re-enable any disabled fields (like primary key)
    const formFields = document.getElementById('formFields');
    if (formFields) {
        formFields.querySelectorAll('input').forEach(input => {
             input.disabled = false;
             input.style.backgroundColor = '';
        });
    }
    // Reset cancel button
    const cancelButton = document.querySelector('#addRecordModal .cancel-btn');
    if (cancelButton) cancelButton.onclick = closeAddRecordModal;
}

// Delete functionality
async function deleteRecord(tableName, record) {
    if (currentUserRole !== 'admin') return;
    
    // More specific confirmation
    let confirmMsg = 'Are you sure you want to delete this record? Details:\n';
    for (const key in record) {
        confirmMsg += `\n${key}: ${record[key]}`;
    }
    if (!confirm(confirmMsg)) return;

    try {
        const result = await fetchWithRole(`/api/table/${tableName}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(record) 
        }); // Error handled by fetchWithRole
        
        console.log('Delete result:', result);
        viewTable(tableName); 
        alert('Record deleted successfully!');
    } catch (error) { 
        console.error('Error deleting record:', error);
        alert(`Error deleting record: ${error.message}`);
    }
}

// Utility functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
         modal.style.display = 'none';
         // If it's the Add/Edit modal, restore its state
         if (modalId === 'addRecordModal') {
             restoreAddRecordForm();
         }
    }
}

function closeAddRecordModal() {
    closeModal('addRecordModal');
}

// NEW Function placeholder for showing book details (e.g., in a modal) - NOW IMPLEMENTED
async function showBookDetails(bookId) {
    console.log(`Fetching details for book ID: ${bookId}`);
    const modal = document.getElementById('bookDetailsModal');
    const titleElement = document.getElementById('bookDetailsTitle');
    const contentElement = document.getElementById('bookDetailsContent');

    if (!modal || !titleElement || !contentElement) {
        console.error('Book details modal elements not found');
        return;
    }

    titleElement.textContent = 'Book Details'; // Reset title
    contentElement.innerHTML = '<p>Loading details...</p>';
    modal.style.display = 'block';
    setupModalClose(modal);

    try {
        const details = await fetchWithRole(`/api/books/details/${bookId}`);
        // Assuming 'details' object has keys like Bid, Bname, Price, Lid, Authors, Publisher, TotalCopies, AvailableCopies
        
        titleElement.textContent = details.Bname || 'Book Details'; // Use Bname from details
        
        // Format details for display
        let detailsHtml = `
            <p><strong>Title:</strong> ${details.Bname || 'N/A'}</p>
            <p><strong>Book ID:</strong> ${details.Bid || 'N/A'}</p>
            <p><strong>Author(s):</strong> ${details.Authors || 'Unknown'}</p>
            <p><strong>Publisher:</strong> ${details.Publisher || 'N/A'}</p>
            <p><strong>Library ID:</strong> ${details.Lid || 'N/A'}</p>
            <p><strong>Price:</strong> ${details.Price ? `$${parseFloat(details.Price).toFixed(2)}` : 'N/A'}</p>
            <p><strong>Total Copies:</strong> ${details.TotalCopies ?? 'N/A'}</p>
            <p><strong>Available Copies:</strong> ${details.AvailableCopies ?? 'N/A'}</p>
            <!-- Add more fields as needed -->
        `;
        contentElement.innerHTML = detailsHtml;

    } catch (error) {
        console.error('Error fetching book details:', error);
        contentElement.innerHTML = `<p class="error">Error loading details: ${error.message}</p>`;
    }
}

// NEW Function to prompt for issue dates
function promptIssueDates(bookId) {
    console.log(`Prompting issue dates for book ID: ${bookId}`);
    // Simple prompt for demonstration - Use a proper modal with date pickers ideally
    const issueDateStr = prompt("Enter Issue Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!issueDateStr) return; // User cancelled
    
    const dueDateStr = prompt("Enter Due Date (YYYY-MM-DD):");
    if (!dueDateStr) return; // User cancelled
    
    // Validate dates (basic)
    const issueDate = new Date(issueDateStr);
    const dueDate = new Date(dueDateStr);
    if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime()) || dueDate <= issueDate) {
        alert("Invalid dates provided. Due date must be after issue date.");
        return;
    }
    
    handleIssueBook(bookId, issueDateStr, dueDateStr);
}

// Modified function to handle book issuing WITH dates
async function handleIssueBook(bookId, issueDate, dueDate) {
    if (currentUserRole !== 'user') return;
    console.log(`Attempting to issue book ID: ${bookId} from ${issueDate} to ${dueDate}`);
    try {
        const result = await fetchWithRole(`/api/books/issue`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                bookId: bookId, 
                userId: 'tempUser', // Placeholder 
                issueDate: issueDate,
                dueDate: dueDate
            })
        }); // Handles errors
        alert(result.message || 'Book issued successfully!');
        // Consider refreshing books or just updating the specific card's availability
    } catch (error) {
        console.error('Error issuing book:', error);
        alert(`Error issuing book: ${error.message}`);
    }
}

// Fetches and stores schema if not already present
async function ensureSchema(tableName) {
    if (!tableSchema[tableName] || tableSchema[tableName].length === 0) {
        console.log(`Schema for ${tableName} not found, fetching...`);
        try {
            const schemaData = await fetchWithRole(`/api/schema/${tableName}`);
             if (!schemaData || !Array.isArray(schemaData.columns)) {
                 throw new Error('Invalid schema format received');
             }
            tableSchema[tableName] = schemaData.columns;
             console.log(`Schema loaded for ${tableName}:`, tableSchema[tableName]);
            return true;
        } catch (schemaError) {
            console.error(`Error fetching schema for table: ${tableName}`, schemaError);
            tableSchema[tableName] = []; // Mark as failed
            alert(`Error fetching table structure for ${tableName}: ${schemaError.message}`);
            return false;
        }
    }
    return true; // Schema already exists
}


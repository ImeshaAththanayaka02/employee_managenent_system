import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/employees';

function App() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  async function loadEmployees() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load employees.');
      }

      setEmployees(data);
    } catch (error) {
      setMessage('Cannot connect to server. Please check the backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function clearForm() {
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('');
    setPosition('');
    setJoiningDate('');
    setEditingId(null);
  }

  function startEdit(employee) {
    setEditingId(employee.id);
    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone);
    setDepartment(employee.department);
    setPosition(employee.position);
    setJoiningDate(
      employee.joining_date
        ? String(employee.joining_date).slice(0, 10)
        : ''
    );
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveEmployee(e) {
    e.preventDefault();
    setMessage('');

    const employee = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      position: position.trim(),
      joining_date: joiningDate
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employee)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save employee.');
      }

      const wasEditing = editingId !== null;

      clearForm();
      setMessage(
        wasEditing
          ? 'Employee updated successfully!'
          : 'Employee saved successfully!'
      );

      await loadEmployees();
    } catch (error) {
      setMessage(error.message || 'Unable to connect to server.');
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete employee.');
      }

      if (editingId === id) clearForm();

      setMessage('Employee deleted successfully!');
      await loadEmployees();
    } catch (error) {
      setMessage(error.message || 'Unable to connect to server.');
    }
  }

  const departmentCount = new Set(
    employees.map((employee) => employee.department)
  ).size;

  const today = new Date().toLocaleDateString('en-CA');

  const newEmployees = employees.filter(
    (employee) => String(employee.joining_date).slice(0, 10) === today
  ).length;

  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      String(employee.name || '').toLowerCase().includes(search) ||
      String(employee.email || '').toLowerCase().includes(search) ||
      String(employee.phone || '').toLowerCase().includes(search) ||
      String(employee.department || '').toLowerCase().includes(search) ||
      String(employee.position || '').toLowerCase().includes(search);

    const matchesDepartment =
      selectedDepartment === '' ||
      employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const departments = [
    ...new Set(employees.map((employee) => employee.department))
  ].sort();

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>EMS.</h2>
        <p className="menu-title">MAIN MENU</p>
        <div className="menu-item active">▦ Dashboard</div>
        <div className="menu-item">♙ Employees</div>
        <div className="menu-item">⚙ Settings</div>
        <div className="sidebar-bottom">
          Employee Management System
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>Employee Management</h2>
            <p>Manage your employees in one place.</p>
          </div>
          <div className="admin">Admin</div>
        </header>

        <section className="welcome">
          <div>
            <p>WELCOME BACK!</p>
            <h1>Employee Dashboard</h1>
            <span>Manage employee information easily.</span>
          </div>
          <div className="welcome-icon">👥</div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Employees</span>
            <h2>{employees.length}</h2>
            <small>Registered employees</small>
          </div>

          <div className="stat-card">
            <span>Departments</span>
            <h2>{departmentCount}</h2>
            <small>Departments represented</small>
          </div>

          <div className="stat-card">
            <span>Joined Today</span>
            <h2>{newEmployees}</h2>
            <small>New employees today</small>
          </div>
        </section>

        <section className="panel">
          <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
          <p className="panel-description">
            {editingId
              ? 'Update the employee details below.'
              : 'Enter the employee details below.'}
          </p>

          <form onSubmit={saveEmployee} className="employee-form">
            <label>
              Full Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </label>

            <label>
              Department
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </label>

            <label>
              Job Position
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Enter job position"
                required
              />
            </label>

            <label>
              Joining Date
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="add-button">
              {editingId ? 'Save Changes' : '+ Add Employee'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>

        {message && (
          <p role="status" style={{ marginBottom: '20px' }}>
            {message}
          </p>
        )}

        <section className="panel">
          <div className="table-heading">
            <div>
              <h2>Employee Records</h2>
              <p className="panel-description">
                Search and filter registered employees.
              </p>
            </div>

            <span className="count">
              {filteredEmployees.length} employees
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone or position..."
              aria-label="Search employees"
              style={{
                width: '100%',
                minWidth: 0,
                padding: '13px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Filter employees by department"
              style={{
                width: '100%',
                minWidth: 0,
                padding: '13px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: '#fff',
                color: '#243b59',
                fontSize: '14px'
              }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
              }}
              style={{
                padding: '8px 13px',
                border: '1px solid #d1d5db',
                borderRadius: '7px',
                background: '#fff',
                color: '#40536e',
                cursor: 'pointer'
              }}
            >
              Clear Search & Filter
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Joining Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="empty">
                      Loading employees...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty">
                      {employees.length === 0
                        ? 'No employees added yet.'
                        : 'No matching employees found.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone}</td>
                      <td>{employee.department}</td>
                      <td>{employee.position}</td>
                      <td>{employee.joining_date}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => startEdit(employee)}
                            style={{
                              padding: '8px 12px',
                              background: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
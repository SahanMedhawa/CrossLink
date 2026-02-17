import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  // --- State Management (Aligned with Mongoose Schema) ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    focusArea: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'active',
    resources: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [resourceInput, setResourceInput] = useState({ name: '', quantity: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- Ref for scrolling ---
  const bodyRef = useRef(null);

  // --- Data Options ---
  const commonSkills = [
    'Teaching', 'Healthcare', 'Technology', 'Marketing', 'Design',
    'Writing', 'Photography', 'Video Editing', 'Social Media',
    'Event Planning', 'Fundraising', 'Project Management',
    'Data Analysis', 'Web Development', 'Counseling',
    'Communication', 'Leadership', 'Public Speaking'
  ];

  const focusAreaOptions = [
    'Education', 'Healthcare', 'Environment', 'Youth',
    'Women Empowerment', 'Poverty Alleviation', 'Animal Welfare',
    'Disaster Relief', 'Arts & Culture', 'Technology'
  ];

  // --- Lock body scroll when modal is open ---
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  // --- Scroll to top when message appears ---
  useEffect(() => {
    if ((message.type === 'error' || message.type === 'success') && bodyRef.current) {
      bodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [message]);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addResource = () => {
    if (resourceInput.name && resourceInput.quantity) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { 
          name: resourceInput.name, 
          quantity: parseInt(resourceInput.quantity),
          description: resourceInput.description 
        }]
      }));
      setResourceInput({ name: '', quantity: '', description: '' });
    }
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- Submission & Validation ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Skill Validation
    if (formData.skills.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one required skill' });
      return;
    }

    // Date Validation
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      setMessage({ type: 'error', text: 'End date cannot be earlier than start date' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('crosslink_token');
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'skills' || key === 'resources') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (imageFile) data.append('image', imageFile);

      await axios.post('http://localhost:5000/api/projects', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success: show message, reset form
      setMessage({ type: 'success', text: 'Project published successfully!' });

      setFormData({
        title: '',
        description: '',
        skills: [],
        focusArea: '',
        location: '',
        startDate: '',
        endDate: '',
        status: 'active',
        resources: []
      });
      setSkillInput('');
      setResourceInput({ name: '', quantity: '', description: '' });
      setImageFile(null);
      setImagePreview(null);

      // Close modal and trigger parent callback
      setTimeout(() => {
        onClose();
        if (onProjectCreated) onProjectCreated();
      }, 2000);

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to sync with database'
      });
    } finally {
      setLoading(false);
    }
  };

  // --- SaaS Styles ---
  const s = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
    },
    modal: {
      backgroundColor: '#fff', width: '100%', maxWidth: '850px', maxHeight: '92vh',
      borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: { padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    body: { padding: '2rem', overflowY: 'auto', flex: 1 },
    footer: { padding: '1.25rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' },
    label: { display: 'block', fontWeight: '600', color: '#1e293b', marginBottom: '0.4rem', fontSize: '0.85rem' },
    input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'border 0.2s' },
    skillBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #3b82f6', background: '#fff', color: '#3b82f6', cursor: 'pointer', fontSize: '12px' },
    skillBtnActive: { background: '#94a3b8', borderColor: '#94a3b8', color: '#fff', cursor: 'not-allowed' },
    tag: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: '#3b82f6', color: '#fff', borderRadius: '99px', fontSize: '12px' },
    btnPrimary: { backgroundColor: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Publish New Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div style={s.body} ref={bodyRef}>
            {message.text && (
              <div style={{ 
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', 
                backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2', 
                color: message.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {message.text}
              </div>
            )}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={s.label}>Project Title *</label>
              <input style={s.input} name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g. Urban Reforestation 2024" />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={s.label}>Detailed Description *</label>
              <textarea style={{ ...s.input, height: '100px', resize: 'vertical' }} name="description" value={formData.description} onChange={handleInputChange} required placeholder="Explain the mission and volunteer impact..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={s.label}>Focus Area *</label>
                <select style={s.input} name="focusArea" value={formData.focusArea} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {focusAreaOptions.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Location *</label>
                <input style={s.input} name="location" value={formData.location} onChange={handleInputChange} required placeholder="City, Country or Remote" />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={s.label}>Required Skills (Select or Type) *</label>
              <input style={s.input} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} placeholder="Add custom skill..." />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {commonSkills.map(skill => (
                  <button key={skill} type="button" onClick={() => addSkill(skill)} style={formData.skills.includes(skill) ? { ...s.skillBtn, ...s.skillBtnActive } : s.skillBtn} disabled={formData.skills.includes(skill)}>
                    {skill}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {formData.skills.map(skill => (
                  <span key={skill} style={s.tag}>
                    {skill} <button type="button" onClick={() => removeSkill(skill)} style={{ border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={s.label}>Logistics & Resources (Mongoose Schema Compliant)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <input style={s.input} placeholder="Resource Name" value={resourceInput.name} onChange={e => setResourceInput({ ...resourceInput, name: e.target.value })} />
                <input style={{ ...s.input, width: '100px' }} type="number" min="1" placeholder="Qty" value={resourceInput.quantity} onChange={e => setResourceInput({ ...resourceInput, quantity: e.target.value })} />
                <button type="button" onClick={addResource} style={{ ...s.btnPrimary, padding: '0 20px', backgroundColor: '#10b981' }}>Add</button>
              </div>
              {formData.resources.map((res, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff', borderRadius: '6px', marginBottom: '4px', border: '1px solid #edf2f7' }}>
                  <span style={{ fontSize: '13px' }}><strong>{res.quantity}x</strong> {res.name}</span>
                  <button type="button" onClick={() => removeResource(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={s.label}>Start Date *</label>
                <input type="date" style={s.input} name="startDate" value={formData.startDate} onChange={handleInputChange} required />
              </div>
              <div>
                <label style={s.label}>End Date *</label>
                <input type="date" style={s.input} name="endDate" value={formData.endDate} onChange={handleInputChange} required />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={s.label}>Cover Image</label>
                <input type="file" onChange={handleImageChange} accept="image/*" style={{ fontSize: '13px' }} />
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ marginTop: '10px', width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={s.label}>Initial Status</label>
              <select style={s.input} name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={s.footer}>
            <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
            <button type="submit" style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Processing...' : 'Sync & Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
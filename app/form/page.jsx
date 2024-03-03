"use client"
import React, { useState } from 'react';

const options = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'art', label: 'Art' },
  { value: 'law', label: 'Law' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'economics', label: 'Economics' },
];

const types = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
];

function page() {
  const [formData, setFormData] = useState({
    subject: '',
    type: '',
    title: '',
    description: '',
    content: '',
  });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData); // Replace this with your submission logic (e.g., sending data to server)
    setFormData({
      subject: '',
      type: '',
      title: '',
      description: '',
      content: '',
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <label htmlFor="subject">Subject</label>
        <select
          id="subject"
          name="subject"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleChange}
          required
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleChange}
          required
        >
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleChange}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </form>
  );
}

export default page;

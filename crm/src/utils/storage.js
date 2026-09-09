// src/utils/storage.js

export const getInquiries = (role) => {
  const data = localStorage.getItem(`${role}_inquiries`);
  return data ? JSON.parse(data) : [];
};

export const addInquiry = (role, inquiry) => {
  const existing = getInquiries(role);
  const updated = [...existing, inquiry];
  localStorage.setItem(`${role}_inquiries`, JSON.stringify(updated));
};

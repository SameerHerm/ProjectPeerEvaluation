import axios from 'axios';

export const registerProfessor = async (data) => {
	// Adjust the URL if your backend runs on a different port
	const res = await axios.post('/api/auth/register', data);
	return res.data;
};
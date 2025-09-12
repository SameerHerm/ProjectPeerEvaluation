import React from 'react';

function App() {
	return (
		<div style={{ padding: '2rem', background: '#f0f0f0' }}>
			<h1>Professor Login</h1>
			<p style={{ color: 'green', fontWeight: 'bold' }}>If you see this, React is rendering correctly!</p>
			<button onClick={() => alert('Button works!')}>Test Button</button>
		</div>
	);
}

export default App;
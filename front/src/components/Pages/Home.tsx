import React from 'react';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { logout } from '../../actions/register';

const Home: React.FC = () => {
	const dispatch = useDispatch();
	return (
		<div>
			<p>Code on!</p>
			<Button
				onClick={() => dispatch(logout())}
				variant='outlined'
				color='error'
			>
				Logout
			</Button>
		</div>
	);
};

export default Home;

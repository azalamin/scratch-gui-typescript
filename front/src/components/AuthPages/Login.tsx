import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';

import { login } from '../../actions/register';
import { Loading } from '../elements/Loading';
import { RootState } from '../../store';
import { ROUTES } from '../../utils/routing/routes';
import { Form, Field, Formik } from 'formik';
import { object, string } from 'yup';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Copyright from '../elements/copyright';

const Login = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		loading: false,
	});
	const isAuthenticated = useSelector<RootState, boolean>(
		state => state.register.isAuthenticated
	);
	const loading = useSelector<RootState, boolean>(
		state => state.register.loading
	);
	const dispatch = useDispatch();
	if (loading && formData.loading) {
		return <Loading />;
	}

	if (isAuthenticated) {
		return <Navigate to={ROUTES.HOME} />;
	}

	return (
		<Grid container component='main' sx={{ height: '100vh' }}>
			<CssBaseline />
			<Grid
				item
				xs={false}
				sm={4}
				md={7}
				sx={{
					backgroundImage: "url('/assets/images/auth.svg')",
					backgroundRepeat: 'no-repeat',
					backgroundColor: t =>
						t.palette.mode === 'light'
							? t.palette.grey[50]
							: t.palette.grey[900],
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			/>
			<Grid item xs={12} sm={8} md={5} style={{ margin: 'auto' }}>
				<Box
					sx={{
						my: 8,
						mx: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<h4>Login to your account</h4>
					<Formik
						initialValues={formData}
						validationSchema={object({
							email: string()
								.required('Please enter email')
								.email('Invalid email'),
							password: string()
								.required('Please enter password')
								.min(7, 'Minimum 7 characters long'),
						})}
						onSubmit={(values, formikHelpers) => {
							setFormData({ ...values, loading: true });
							dispatch(login(values));
							formikHelpers.resetForm();
						}}
					>
						{({ errors, isValid, touched, dirty, handleSubmit }) => (
							<Form onSubmit={handleSubmit} className='form-container'>
								<Field
									className='input-field'
									type='email'
									name='email'
									placeholder='Email Address'
									size='lg'
									as={TextField}
									label='Email'
									required
									error={Boolean(errors.email) && Boolean(touched.email)}
									helperText={Boolean(touched.email) && errors.email}
								/>
								<Box height={14} />
								<Field
									className='input-field'
									type='password'
									name='password'
									placeholder='Password'
									size='lg'
									label='Password'
									required
									as={TextField}
									error={Boolean(errors.password) && Boolean(touched.password)}
									helperText={Boolean(touched.password) && errors.password}
								/>
								<Box height={20} />
								<div style={{ width: '100%', textAlign: 'center' }}>
									<Button
										disabled={!isValid || !dirty}
										type='submit'
										variant='contained'
										className='form-button'
										sx={{ background: '#073A93' }}
									>
										Login
									</Button>
									<Box height={7} />
									<Link to={ROUTES.REGISTER} className='form-link'>
										New to the Page?
									</Link>
								</div>
							</Form>
						)}
					</Formik>
				</Box>
				<Copyright sx={{ mt: 5 }} style={{ margin: 'auto' }} />
			</Grid>
		</Grid>
	);
};

export default Login;

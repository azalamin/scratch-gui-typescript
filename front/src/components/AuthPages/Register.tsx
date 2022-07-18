import { Dispatch, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { register } from '../../actions/register';
import { Loading } from '../elements/Loading';
import { RootState } from '../../store';
import { ROUTES } from '../../utils/routing/routes';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Form, Field, Formik } from 'formik';
import { object, string } from 'yup';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Copyright from '../elements/copyright';
import { Google } from '@mui/icons-material';

let emptyArray: any[] = [];
const Register = () => {
	const [formData, setFormData] = useState({
		errors: emptyArray,
		userName: '',
		email: '',
		password: '',
		name: '',
		confirmPassword: '',
		loading: false,
	});
	const isAuthenticated = useSelector<RootState, boolean>(
		state => state.register.isAuthenticated
	);
	const loading = useSelector<RootState, boolean>(
		state => state.register.loading
	);
	const dispatch: Dispatch<any> = useDispatch();

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
					<h4>Register your Account</h4>
					<Formik
						initialValues={formData}
						validationSchema={object({
							email: string()
								.required('Please enter email')
								.email('Invalid email'),
							name: string()
								.required('Please enter name')
								.min(2, 'Name too short'),
							password: string()
								.required('Please enter password')
								.min(7, 'Password should be minimum 7 characters long'),
							confirmPassword: string().required('Please confirm password'),
						})}
						onSubmit={(values, formikHelpers) => {
							console.log(values);
							formikHelpers.resetForm();
							if (values.password === values.confirmPassword) {
								setFormData({ ...values, loading: true });
								dispatch(register(values));
							}
						}}
					>
						{({ errors, isValid, touched, dirty, handleSubmit }) => (
							<Form onSubmit={handleSubmit} className='form-container'>
								<div className='row'>
									<Field
										className='input-field'
										type='text'
										name='name'
										placeholder='Name'
										size='lg'
										required
										label='Name'
										as={TextField}
										error={Boolean(errors.name) && Boolean(touched.name)}
										helperText={Boolean(touched.name) && errors.name}
									/>
								</div>
								<Box height={14} />
								<div className='row'>
									<Field
										className='input-field'
										type='email'
										name='email'
										placeholder='Email Address'
										label='Email'
										size='lg'
										required
										as={TextField}
										error={Boolean(errors.email) && Boolean(touched.email)}
										helperText={Boolean(touched.email) && errors.email}
									/>
								</div>
								<Box height={14} />
								<div className='row'>
									<Field
										className='input-field'
										type='password'
										name='password'
										placeholder='Password'
										size='lg'
										label='Password'
										required
										as={TextField}
										error={
											Boolean(errors.password) && Boolean(touched.password)
										}
										helperText={Boolean(touched.password) && errors.password}
									/>
								</div>
								<Box height={14} />
								<div className='row'>
									<Field
										className='input-field'
										type='password'
										name='confirmPassword'
										placeholder='Confirm Password'
										size='lg'
										label='Confirm Password'
										required
										as={TextField}
										error={
											Boolean(errors.confirmPassword) &&
											Boolean(touched.confirmPassword)
										}
										helperText={
											Boolean(touched.confirmPassword) && errors.confirmPassword
										}
									/>
								</div>
								<Box height={20} />
								<div style={{ width: '100%', textAlign: 'center' }}>
									<Button
										disabled={!isValid || !dirty}
										type='submit'
										variant='contained'
										className='form-button'
										sx={{ background: '#073A93' }}
									>
										Register
									</Button>
									<br />
									<hr />
									{/* <Button variant='contained' startIcon={<Google />}>
										Sign in with Google
									</Button> */}
									<Box height={7} />
									<Link to={ROUTES.LOGIN} className='form-link'>
										Already Have an Account?
									</Link>
								</div>
							</Form>
						)}
					</Formik>
					<Copyright sx={{ mt: 5 }} />
				</Box>
			</Grid>
		</Grid>
	);
};

export default Register;

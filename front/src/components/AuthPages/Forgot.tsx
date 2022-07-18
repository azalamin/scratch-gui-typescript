import React, { FormEvent, ChangeEvent, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { forgot } from '../../actions/register';
import { RootState } from '../../store';
import { ALERT_TYPE } from '../../utils/consts';
import { ROUTES } from '../../utils/routing/routes';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Form, Field, Formik } from 'formik';
import { object, string } from 'yup';

const Forgot = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [formData, setFormData] = useState({ email: '' });
	const isAuthenticated = useSelector<RootState, boolean>(
		state => state.register.isAuthenticated
	);

	if (isAuthenticated) {
		return <Navigate to={ROUTES.HOME} />;
	}

	const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formData.email) {
			dispatch(setAlert('Please Enter Email', ALERT_TYPE.DANGER));
		} else {
			dispatch(forgot(formData.email));
			navigate(ROUTES.LOGIN);
		}
	};

	return (
		<Formik
			initialValues={formData}
			validationSchema={object({
				email: string().required('Please enter email').email('Invalid email'),
				name: string().required('Please enter name').min(2, 'Name too short'),
				password: string()
					.required('Please enter password')
					.min(7, 'Password should be minimum 7 characters long'),
			})}
			onSubmit={(values, formikHelpers) => {
				console.log(values);
				formikHelpers.resetForm();
			}}
		>
			{({ errors, isValid, touched, dirty }) => (
				<Form onSubmit={onSubmit} className='form-container'>
					<div className='row'>
						<Field
							className='input-field'
							type='email'
							name='email'
							placeholder='Email Address'
							size='lg'
							required
							onChange={onChangeHandler}
							as={TextField}
							error={Boolean(errors.email) && Boolean(touched.email)}
							helperText={Boolean(touched.email) && errors.email}
						/>
					</div>
					<Button
						disabled={!isValid || !dirty}
						type='submit'
						variant='contained'
						className='form-button'
						sx={{ background: '#073A93' }}
					>
						Login
					</Button>
				</Form>
			)}
		</Formik>
	);
};

export default Forgot;

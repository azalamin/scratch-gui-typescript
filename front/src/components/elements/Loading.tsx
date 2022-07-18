import { FC } from 'react';

const LoadingGif: JSX.Element = (
	<div className='im'>
		<div
			style={{
				left: '46%',
				position: 'fixed',
				top: '40%',
				textAlign: 'center',
			}}
		>
			<i className='fa fa-cog fa-8x fa-spin' style={{ color: 'white' }} />
			<div style={{ color: 'white', position: 'absolute' }}>
				Setting Things Up!
			</div>
		</div>
	</div>
);

const Loading: FC = () => {
	return (
		<div className='im'>
			<div
				style={{
					left: '46%',
					position: 'fixed',
					top: '40%',
					textAlign: 'center',
				}}
			>
				<i className='fa fa-cog fa-8x fa-spin' style={{ color: 'white' }} />
				<div style={{ color: 'white', position: 'absolute' }}>
					Setting Things Up!
				</div>
			</div>
		</div>
	);
};

export { Loading, LoadingGif };

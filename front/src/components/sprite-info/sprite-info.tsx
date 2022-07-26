import classNames from 'classnames';
import React from 'react';

import DirectionPicker from '../../containers/direction-picker';
import Box from '../box/box';
import BufferedInputHOC from '../forms/buffered-input-hoc';
import Input from '../forms/input';
import Label from '../forms/label';

import { defineMessages, FormattedMessage, injectIntl, IntlShape } from 'react-intl';

import { STAGE_DISPLAY_SIZES } from '../../lib/layout-constants';
import { isWideLocale } from '../../lib/locale-utils';

import styles from './spriteInfo.module.css';

import hideIcon from './icon--hide.svg';
import showIcon from './icon--show.svg';
import xIcon from './icon--x.svg';
import yIcon from './icon--y.svg';

const BufferedInput: any = BufferedInputHOC(Input);

const messages = defineMessages({
	spritePlaceholder: {
		id: 'gui.SpriteInfo.spritePlaceholder',
		defaultMessage: 'Name',
		description: 'Placeholder text for sprite name',
	},
});

class SpriteInfo extends React.Component<PropsInterface> {
	shouldComponentUpdate(nextProps: any) {
		return (
			this.props.rotationStyle !== nextProps.rotationStyle ||
			this.props.disabled !== nextProps.disabled ||
			this.props.name !== nextProps.name ||
			this.props.stageSize !== nextProps.stageSize ||
			this.props.visible !== nextProps.visible ||
			// Only update these if rounded value has changed
			Math.round(this.props.direction) !== Math.round(nextProps.direction) ||
			Math.round(this.props.size) !== Math.round(nextProps.size) ||
			Math.round(this.props.x) !== Math.round(nextProps.x) ||
			Math.round(this.props.y) !== Math.round(nextProps.y)
		);
	}
	render() {
		const { stageSize } = this.props;

		const sprite = (
			<FormattedMessage
				defaultMessage='Sprite'
				description='Sprite info label'
				id='gui.SpriteInfo.sprite'
			/>
		);
		const showLabel = (
			<FormattedMessage
				defaultMessage='Show'
				description='Sprite info show label'
				id='gui.SpriteInfo.show'
			/>
		);
		const sizeLabel = (
			<FormattedMessage
				defaultMessage='Size'
				description='Sprite info size label'
				id='gui.SpriteInfo.size'
			/>
		);

		const labelAbove = isWideLocale(this.props.intl.locale);

		const spriteNameInput = (
			<BufferedInput
				className={classNames(styles.spriteInput, {
					[styles.columnInput]: labelAbove,
				})}
				disabled={this.props.disabled}
				placeholder={this.props.intl.formatMessage(messages.spritePlaceholder, '', '', '', '')}
				tabIndex='0'
				type='text'
				value={this.props.disabled ? '' : this.props.name}
				onSubmit={this.props.onChangeName}
			/>
		);

		const xPosition = (
			<div className={styles.group}>
				{stageSize === STAGE_DISPLAY_SIZES.large ? (
					<div className={styles.iconWrapper}>
						<img
							aria-hidden='true'
							className={classNames(styles.xIcon, styles.icon)}
							src={xIcon}
							alt=''
						/>
					</div>
				) : null}
				<Label text='x'>
					<BufferedInput
						small
						disabled={this.props.disabled}
						placeholder='x'
						tabIndex='0'
						type='text'
						value={this.props.disabled ? '' : Math.round(this.props.x)}
						onSubmit={this.props.onChangeX}
					/>
				</Label>
			</div>
		);

		const yPosition = (
			<div className={styles.group}>
				{stageSize === STAGE_DISPLAY_SIZES.large ? (
					<div className={styles.iconWrapper}>
						<img
							aria-hidden='true'
							className={classNames(styles.yIcon, styles.icon)}
							src={yIcon}
							alt=''
						/>
					</div>
				) : null}
				<Label text='y'>
					<BufferedInput
						small
						disabled={this.props.disabled}
						placeholder='y'
						tabIndex='0'
						type='text'
						value={this.props.disabled ? '' : Math.round(this.props.y)}
						onSubmit={this.props.onChangeY}
					/>
				</Label>
			</div>
		);

		if (stageSize === STAGE_DISPLAY_SIZES.small) {
			return (
				<Box className={styles.spriteInfo}>
					<div className={classNames(styles.row, styles.rowPrimary)}>
						<div className={styles.group}>{spriteNameInput}</div>
					</div>
					<div className={classNames(styles.row, styles.rowSecondary)}>
						{xPosition}
						{yPosition}
					</div>
				</Box>
			);
		}

		return (
			<Box className={styles.spriteInfo}>
				<div className={classNames(styles.row, styles.rowPrimary)}>
					<div className={styles.group}>
						<Label above={labelAbove} text={sprite}>
							{spriteNameInput}
						</Label>
					</div>
					{xPosition}
					{yPosition}
				</div>
				<div className={classNames(styles.row, styles.rowSecondary)}>
					<div className={labelAbove ? styles.column : styles.group}>
						{stageSize === STAGE_DISPLAY_SIZES.large ? <Label secondary text={showLabel} /> : null}
						<div className={styles.radioWrapper}>
							<div
								className={classNames(styles.radio, styles.radioFirst, styles.iconWrapper, {
									[styles.isActive]: this.props.visible && !this.props.disabled,
									[styles.isDisabled]: this.props.disabled,
								})}
								tabIndex={0}
								onClick={this.props.onClickVisible}
								onKeyPress={this.props.onPressVisible}
							>
								<img className={styles.icon} src={showIcon} alt='' />
							</div>
							<div
								className={classNames(styles.radio, styles.radioLast, styles.iconWrapper, {
									[styles.isActive]: !this.props.visible && !this.props.disabled,
									[styles.isDisabled]: this.props.disabled,
								})}
								tabIndex={0}
								onClick={this.props.onClickNotVisible}
								onKeyPress={this.props.onPressNotVisible}
							>
								<img className={styles.icon} src={hideIcon} alt='' />
							</div>
						</div>
					</div>
					<div className={classNames(styles.group, styles.largerInput)}>
						<Label secondary above={labelAbove} text={sizeLabel}>
							<BufferedInput
								small
								disabled={this.props.disabled}
								label={sizeLabel}
								tabIndex='0'
								type='text'
								value={this.props.disabled ? '' : Math.round(this.props.size)}
								onSubmit={this.props.onChangeSize}
							/>
						</Label>
					</div>
					<div className={classNames(styles.group, styles.largerInput)}>
						<DirectionPicker
							direction={Math.round(this.props.direction)}
							disabled={this.props.disabled}
							labelAbove={labelAbove}
							rotationStyle={this.props.rotationStyle}
							onChangeDirection={this.props.onChangeDirection}
							onChangeRotationStyle={this.props.onChangeRotationStyle}
						/>
					</div>
				</div>
			</Box>
		);
	}
}

interface PropsInterface {
	direction?: any;
	disabled?: boolean;
	intl: IntlShape;
	name?: string;
	onChangeDirection?: any;
	onChangeName?: any;
	onChangeRotationStyle?: any;
	onChangeSize?: any;
	onChangeX?: any;
	onChangeY?: any;
	onClickVisible?: any;
	onPressNotVisible?: any;
	onPressVisible?: any;
	rotationStyle?: string;
	size?: any;
	stageSize?: any;
	visible?: boolean;
	x?: any;
	y?: any;
	onClickNotVisible?: any;
}

// TODO
// SpriteInfo.propTypes = {
//     direction: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number
//     ]),
//     disabled: PropTypes.bool,
//     intl: intlShape,
//     name: PropTypes.string,
//     onChangeDirection: PropTypes.func,
//     onChangeName: PropTypes.func,
//     onChangeRotationStyle: PropTypes.func,
//     onChangeSize: PropTypes.func,
//     onChangeX: PropTypes.func,
//     onChangeY: PropTypes.func,
//     onClickNotVisible: PropTypes.func,
//     onClickVisible: PropTypes.func,
//     onPressNotVisible: PropTypes.func,
//     onPressVisible: PropTypes.func,
//     rotationStyle: PropTypes.string,
//     size: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number
//     ]),
//     stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
//     visible: PropTypes.bool,
//     x: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number
//     ]),
//     y: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number
//     ])
// };

export default injectIntl(SpriteInfo as any) as any;

import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';

import MonitorComponent, { monitorModes } from '../components/monitor/monitor';
import downloadBlob from '../lib/download-blob';
import importCSV from '../lib/import-csv';
import monitorAdapter from '../lib/monitor-adapter';
import { getVariable, setVariableValue } from '../lib/variable-utils';
import {
	addMonitorRect,
	getInitialPosition,
	removeMonitorRect,
	resizeMonitorRect,
} from '../reducers/monitor-layout';
import SliderPrompt from './slider-prompt';

import { Map } from 'immutable';
import { connect } from 'react-redux';

const availableModes = (opcode: any) =>
	monitorModes.filter((t: any) => {
		if (opcode === 'data_variable') {
			return t !== 'list';
		} else if (opcode === 'data_listcontents') {
			return t === 'list';
		}
		return t !== 'slider' && t !== 'list';
	});

const messages = defineMessages({
	columnPrompt: {
		defaultMessage: 'Which column should be used (1-{numberOfColumns})?',
		description: 'Prompt for which column should be used',
		id: 'gui.monitors.importListColumnPrompt',
	},
});

const Monitor = (props: PropsInterface) => {
	const [sliderPrompt, setSliderPrompt] = useState<any>(false);
	let element: any = useRef();

	useEffect(() => {
		let rect;

		const isNum = (num: any) => typeof num === 'number' && !isNaN(num);

		// Load the VM provided position if not loaded already
		// If a monitor has numbers for the x and y positions, load the saved position.
		// Otherwise, auto-position the monitor.
		if (isNum(props.x) && isNum(props.y) && !props.monitorLayout.savedMonitorPositions[props.id]) {
			rect = {
				upperStart: { x: props.x, y: props.y },
				lowerEnd: {
					x: props.x + element.offsetWidth,
					y: props.y + element.offsetHeight,
				},
			};
			props.addMonitorRect(props.id, rect, true /* savePosition */);
		} else {
			// Newly created user monitor
			rect = getInitialPosition(
				props.monitorLayout,
				props.id,
				element.offsetWidth,
				element.offsetHeight
			);
			props.addMonitorRect(props.id, rect);
			props.vm.runtime.requestUpdateMonitor(
				Map({
					id: props.id,
					x: rect.upperStart.x,
					y: rect.upperStart.y,
				})
			);
		}
		element.style.top = `${rect.upperStart.y}px`;
		element.style.left = `${rect.upperStart.x}px`;

		return () => {
			props.removeMonitorRect(props.id);
		};
	}, [props]);

	const handleDragEnd = (e: any, { x, y }: any) => {
		const newX = parseInt(element.style.left, 10) + x;
		const newY = parseInt(element.style.top, 10) + y;
		props.onDragEnd(props.id, newX, newY);
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				x: newX,
				y: newY,
			})
		);
	};
	const handleHide = () => {
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				visible: false,
			})
		);
	};
	const handleNextMode = () => {
		const modes = availableModes(props.opcode);
		const modeIndex = modes.indexOf(props.mode);
		const newMode = modes[(modeIndex + 1) % modes.length];
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				mode: newMode,
			})
		);
	};
	const handleSetModeToDefault = () => {
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				mode: 'default',
			})
		);
	};
	const handleSetModeToLarge = () => {
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				mode: 'large',
			})
		);
	};
	const handleSetModeToSlider = () => {
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				mode: 'slider',
			})
		);
	};
	const handleSliderPromptClose = () => {
		setSliderPrompt(false);
	};
	const handleSliderPromptOpen = () => {
		setSliderPrompt(true);
	};
	const handleSliderPromptOk = (min: any, max: any, isDiscrete: any) => {
		const realMin = Math.min(min, max);
		const realMax = Math.max(min, max);
		props.vm.runtime.requestUpdateMonitor(
			Map({
				id: props.id,
				sliderMin: realMin,
				sliderMax: realMax,
				isDiscrete: isDiscrete,
			})
		);
		handleSliderPromptClose();
	};
	const setElement: any = (monitorElt: any) => {
		element = monitorElt;
	};
	const handleImport: any = () => {
		importCSV().then((rows: any) => {
			const numberOfColumns = rows[0].length;
			let columnNumber: any = 1;
			if (numberOfColumns > 1) {
				const msg: any = props.intl.formatMessage(
					messages.columnPrompt,
					numberOfColumns,
					'',
					'',
					''
				);
				columnNumber = parseInt(msg, 10);
			}
			const newListValue = rows
				.map((row: any) => row[columnNumber - 1])
				.filter((item: any) => typeof item === 'string'); // CSV importer can leave undefineds
			const { vm, targetId, id: variableId } = props;
			setVariableValue(vm, targetId, variableId, newListValue);
		});
	};
	const handleExport = () => {
		const { vm, targetId, id: variableId } = props;
		const variable = getVariable(vm, targetId, variableId);
		const text = variable.value.join('\r\n');
		const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		downloadBlob(`${variable.name}.txt`, blob);
	};

	const monitorProps = monitorAdapter(props);
	const showSliderOption = availableModes(props.opcode).indexOf('slider') !== -1;
	const isList = props.mode === 'list';

	return (
		<React.Fragment>
			{sliderPrompt.sliderPrompt && (
				<SliderPrompt
					isDiscrete={props.isDiscrete}
					maxValue={parseFloat(props.max)}
					minValue={parseFloat(props.min)}
					onCancel={handleSliderPromptClose}
					onOk={handleSliderPromptOk}
				/>
			)}
			<MonitorComponent
				componentRef={setElement}
				{...monitorProps}
				draggable={props.draggable}
				height={props.height}
				isDiscrete={props.isDiscrete}
				max={props.max}
				min={props.min}
				mode={props.mode}
				targetId={props.targetId}
				width={props.width}
				onDragEnd={handleDragEnd}
				onExport={isList ? handleExport : null}
				onImport={isList ? handleImport : null}
				onHide={handleHide}
				onNextMode={handleNextMode}
				onSetModeToDefault={isList ? null : handleSetModeToDefault}
				onSetModeToLarge={isList ? null : handleSetModeToLarge}
				onSetModeToSlider={showSliderOption ? handleSetModeToSlider : null}
				onSliderPromptOpen={handleSliderPromptOpen}
			/>
		</React.Fragment>
	);
};

interface PropsInterface {
	addMonitorRect: any;
	draggable: any;
	height: number;
	id: string;
	intl: IntlShape;
	isDiscrete: boolean;
	max: any;
	min: any;
	mode: any;
	monitorLayout: any;
	onDragEnd: any;
	opcode: string; // eslint-disable-line react/no-unused-prop-types
	params: object; // eslint-disable-line react/no-unused-prop-types, react/forbid-prop-types
	removeMonitorRect: any;
	resizeMonitorRect: any;
	spriteName: string; // eslint-disable-line react/no-unused-prop-types
	targetId: string;
	value: any;
	vm: any;
	width: number;
	x: number;
	y: number;
}

// TODO
// Monitor.propTypes = {
//     addMonitorRect: PropTypes.func.isRequired,
//     draggable: PropTypes.bool,
//     height: PropTypes.number,
//     id: PropTypes.string.isRequired,
//     intl: intlShape,
//     isDiscrete: PropTypes.bool,
//     max: PropTypes.number,
//     min: PropTypes.number,
//     mode: PropTypes.oneOf(['default', 'slider', 'large', 'list']),
//     monitorLayout: PropTypes.shape({
//         monitors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
//         savedMonitorPositions: PropTypes.object // eslint-disable-line react/forbid-prop-types
//     }).isRequired,
//     onDragEnd: PropTypes.func.isRequired,
//     opcode: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
//     params: PropTypes.object, // eslint-disable-line react/no-unused-prop-types, react/forbid-prop-types
//     removeMonitorRect: PropTypes.func.isRequired,
//     resizeMonitorRect: PropTypes.func.isRequired,
//     spriteName: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
//     targetId: PropTypes.string,
//     value: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number,
//         PropTypes.arrayOf(PropTypes.oneOfType([
//             PropTypes.string,
//             PropTypes.number
//         ]))
//     ]), // eslint-disable-line react/no-unused-prop-types
//     vm: PropTypes.instanceOf(VM),
//     width: PropTypes.number,
//     x: PropTypes.number,
//     y: PropTypes.number
// };

const mapStateToProps = (state: any) => ({
	monitorLayout: state.scratchGui.monitorLayout,
	vm: state.scratchGui.vm,
});
const mapDispatchToProps = (dispatch: any) => ({
	addMonitorRect: (id: any, rect: any, savePosition: any) =>
		dispatch(addMonitorRect(id, rect.upperStart, rect.lowerEnd, savePosition)),
	resizeMonitorRect: (id: any, newWidth: any, newHeight: any) =>
		dispatch(resizeMonitorRect(id, newWidth, newHeight)),
	removeMonitorRect: (id: any) => dispatch(removeMonitorRect(id)),
});

export default React.memo(injectIntl(connect(mapStateToProps, mapDispatchToProps)(Monitor)));

import bindAll from 'lodash.bindall';
import debounce from 'lodash.debounce';
import defaultsDeep from 'lodash.defaultsdeep';
import React from 'react';
import VMScratchBlocks from '../lib/blocks';
import makeToolboxXML from '../lib/make-toolbox-xml';

import BlocksComponent from '../components/blocks/blocks';
import defineDynamicBlock from '../lib/define-dynamic-block';
import DragConstants from '../lib/drag-constants';
import DropAreaHOC from '../lib/drop-area-hoc';
import errorBoundaryHOC from '../lib/error-boundary-hoc';
import { BLOCKS_DEFAULT_SCALE } from '../lib/layout-constants';
import extensionData from '../lib/libraries/extensions/index';
import log from '../lib/log';
import CustomProcedures from './custom-procedures';
import ExtensionLibrary from './extension-library';
import Prompt from './prompt';

import { connect } from 'react-redux';
import { activateColorPicker } from '../reducers/color-picker';
import { setConnectionModalExtensionId } from '../reducers/connection-modal';
import {
  activateCustomProcedures,
  deactivateCustomProcedures,
} from '../reducers/custom-procedures';
import {
  closeExtensionLibrary,
  openConnectionModal,
  openSoundRecorder,
} from '../reducers/modals';
import { updateToolbox } from '../reducers/toolbox';
import { updateMetrics } from '../reducers/workspace-metrics';

import { boolean } from 'yup';
import { activateTab, SOUNDS_TAB_INDEX } from '../reducers/editor-tab';

const addFunctionListener = (object: any, property: any, callback: any) => {
  const oldFn = object[property];
  object[property] = function (...args: any) {
    const result = oldFn.apply(this, args);
    callback.apply(this, result);
    return result;
  };
};

const DroppableBlocks = DropAreaHOC([DragConstants.BACKPACK_CODE])(
  BlocksComponent
);

// TODO Should component update
// const areEqual = (prevProps: any, nextProps) => {
//   return (
//     nextProps.isVisible !== prevProps.isVisible ||
//     nextProps._renderedToolboxXML !== prevProps.toolboxXML ||
//     nextProps.extensionLibraryVisible !== prevProps.extensionLibraryVisible ||
//     nextProps.customProceduresVisible !== prevProps.customProceduresVisible ||
//     nextProps.locale !== prevProps.locale ||
//     nextProps.anyModalVisible !== prevProps.anyModalVisible ||
//     nextProps.stageSize !== prevProps.stageSize
//   );
// };

class Blocks extends React.Component<PropsInterface, StateInterface> {
  static defaultProps: { isVisible: boolean; options: any };
  static defaultOptions: any;
  ScratchBlocks: any;
  toolboxUpdateQueue: any;
  workspace: any;
  _renderedToolboxXML: any;
  setToolboxRefreshEnabled: any;
  toolboxUpdateTimeout: any;
  flyoutWorkspace: any;
  constructor(props: PropsInterface) {
    super(props);
    this.ScratchBlocks = VMScratchBlocks(props.vm);
    bindAll(this, [
      'attachVM',
      'detachVM',
      'getToolboxXML',
      'handleCategorySelected',
      'handleConnectionModalStart',
      'handleDrop',
      'handleStatusButtonUpdate',
      'handleOpenSoundRecorder',
      'handlePromptStart',
      'handlePromptCallback',
      'handlePromptClose',
      'handleCustomProceduresClose',
      'onScriptGlowOn',
      'onScriptGlowOff',
      'onBlockGlowOn',
      'onBlockGlowOff',
      'handleMonitorsUpdate',
      'handleExtensionAdded',
      'handleBlocksInfoUpdate',
      'onTargetsUpdate',
      'onVisualReport',
      'onWorkspaceUpdate',
      'onWorkspaceMetricsChange',
      'setBlocks',
      'setLocale',
    ]);
    this.ScratchBlocks.prompt = this.handlePromptStart;
    this.ScratchBlocks.statusButtonCallback = this.handleConnectionModalStart;
    this.ScratchBlocks.recordSoundCallback = this.handleOpenSoundRecorder;

    this.state = {
      prompt: null,
    };
    this.onTargetsUpdate = debounce(this.onTargetsUpdate, 100);
    this.toolboxUpdateQueue = [];
  }
  componentDidMount() {
    this.ScratchBlocks.FieldColourSlider.activateEyedropper_ =
      this.props.onActivateColorPicker;
    this.ScratchBlocks.Procedures.externalProcedureDefCallback =
      this.props.onActivateCustomProcedures;
    this.ScratchBlocks.ScratchMsgs.setLocale(this.props.locale);

    const workspaceConfig = defaultsDeep(
      {},
      Blocks.defaultOptions,
      this.props.options,
      { rtl: this.props.isRtl, toolbox: this.props.toolboxXML }
    );
    this.workspace = this.ScratchBlocks.inject(this.blocks, workspaceConfig);

    // Register buttons under new callback keys for creating variables,
    // lists, and procedures from extensions.

    const toolboxWorkspace = this.workspace.getFlyout().getWorkspace();

    const varListButtonCallback = (type: any) => () =>
      this.ScratchBlocks.Variables.createVariable(this.workspace, null, type);
    const procButtonCallback = () => {
      this.ScratchBlocks.Procedures.createProcedureDefCallback_(this.workspace);
    };

    toolboxWorkspace.registerButtonCallback(
      'MAKE_A_VARIABLE',
      varListButtonCallback('')
    );
    toolboxWorkspace.registerButtonCallback(
      'MAKE_A_LIST',
      varListButtonCallback('list')
    );
    toolboxWorkspace.registerButtonCallback(
      'MAKE_A_PROCEDURE',
      procButtonCallback
    );

    // Store the xml of the toolbox that is actually rendered.
    // This is used in componentDidUpdate instead of prevProps, because
    // the xml can change while e.g. on the costumes tab.
    this._renderedToolboxXML = this.props.toolboxXML;

    // we actually never want the workspace to enable "refresh toolbox" - this basically re-renders the
    // entire toolbox every time we reset the workspace.  We call updateToolbox as a part of
    // componentDidUpdate so the toolbox will still correctly be updated
    this.setToolboxRefreshEnabled =
      this.workspace.setToolboxRefreshEnabled.bind(this.workspace);
    this.workspace.setToolboxRefreshEnabled = () => {
      this.setToolboxRefreshEnabled(false);
    };

    // @todo change this when blockly supports UI events
    addFunctionListener(
      this.workspace,
      'translate',
      this.onWorkspaceMetricsChange
    );
    addFunctionListener(this.workspace, 'zoom', this.onWorkspaceMetricsChange);

    this.attachVM();
    // Only update blocks/vm locale when visible to avoid sizing issues
    // If locale changes while not visible it will get handled in didUpdate
    if (this.props.isVisible) {
      this.setLocale();
    }
  }
  blocks(_blocks: any, _workspaceConfig: any): any {
    throw new Error('Method not implemented.');
  }
  shouldComponentUpdate(
    nextProps: {
      isVisible: boolean;
      toolboxXML: string;
      extensionLibraryVisible: boolean;
      customProceduresVisible: boolean;
      locale: string;
      anyModalVisible: boolean;
      stageSize: any;
    },
    nextState: { prompt: any }
  ) {
    return (
      this.state.prompt !== nextState.prompt ||
      this.props.isVisible !== nextProps.isVisible ||
      this._renderedToolboxXML !== nextProps.toolboxXML ||
      this.props.extensionLibraryVisible !==
        nextProps.extensionLibraryVisible ||
      this.props.customProceduresVisible !==
        nextProps.customProceduresVisible ||
      this.props.locale !== nextProps.locale ||
      this.props.anyModalVisible !== nextProps.anyModalVisible ||
      this.props.stageSize !== nextProps.stageSize
    );
  }
  componentDidUpdate(prevProps: any) {
    // If any modals are open, call hideChaff to close z-indexed field editors
    if (this.props.anyModalVisible && !prevProps.anyModalVisible) {
      this.ScratchBlocks.hideChaff();
    }

    // Only rerender the toolbox when the blocks are visible and the xml is
    // different from the previously rendered toolbox xml.
    // Do not check against prevProps.toolboxXML because that may not have been rendered.
    if (
      this.props.isVisible &&
      this.props.toolboxXML !== this._renderedToolboxXML
    ) {
      this.requestToolboxUpdate();
    }

    if (this.props.isVisible === prevProps.isVisible) {
      if (this.props.stageSize !== prevProps.stageSize) {
        // force workspace to redraw for the new stage size
        window.dispatchEvent(new Event('resize'));
      }
      return;
    }
    // @todo hack to resize blockly manually in case resize happened while hidden
    // @todo hack to reload the workspace due to gui bug #413
    if (this.props.isVisible) {
      // Scripts tab
      this.workspace.setVisible(true);
      if (
        prevProps.locale !== this.props.locale ||
        this.props.locale !== this.props.vm.getLocale()
      ) {
        // call setLocale if the locale has changed, or changed while the blocks were hidden.
        // vm.getLocale() will be out of sync if locale was changed while not visible
        this.setLocale();
      } else {
        this.props.vm.refreshWorkspace();
        this.requestToolboxUpdate();
      }

      window.dispatchEvent(new Event('resize'));
    } else {
      this.workspace.setVisible(false);
    }
  }
  componentWillUnmount() {
    this.detachVM();
    this.workspace.dispose();
    clearTimeout(this.toolboxUpdateQueue);
  }
  requestToolboxUpdate() {
    clearTimeout(this.toolboxUpdateQueue);
    this.toolboxUpdateTimeout = setTimeout(() => {
      this.updateToolbox();
    }, 0);
  }
  setLocale() {
    this.ScratchBlocks.ScratchMsgs.setLocale(this.props.locale);
    this.props.vm.setLocale(this.props.locale, this.props.messages).then(() => {
      this.workspace.getFlyout().setRecyclingEnabled(false);
      this.props.vm.refreshWorkspace();
      this.requestToolboxUpdate();
      this.withToolboxUpdates(() => {
        this.workspace.getFlyout().setRecyclingEnabled(true);
      });
    });
  }

  updateToolbox() {
    this.toolboxUpdateTimeout = false;

    const categoryId = this.workspace.toolbox_.getSelectedCategoryId();
    const offset = this.workspace.toolbox_.getCategoryScrollOffset();
    this.workspace.updateToolbox(this.props.toolboxXML);
    this._renderedToolboxXML = this.props.toolboxXML;

    // In order to catch any changes that mutate the toolbox during "normal runtime"
    // (variable changes/etc), re-enable toolbox refresh.
    // Using the setter function will rerender the entire toolbox which we just rendered.
    this.workspace.toolboxRefreshEnabled_ = true;

    const currentCategoryPos =
      this.workspace.toolbox_.getCategoryPositionById(categoryId);
    const currentCategoryLen =
      this.workspace.toolbox_.getCategoryLengthById(categoryId);
    if (offset < currentCategoryLen) {
      this.workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos + offset);
    } else {
      this.workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos);
    }

    const queue = this.toolboxUpdateQueue;
    this.toolboxUpdateQueue = [];
    queue.forEach((fn: any) => fn());
  }

  withToolboxUpdates(fn: any) {
    // if there is a queued toolbox update, we need to wait
    if (this.toolboxUpdateTimeout) {
      this.toolboxUpdateQueue.push(fn);
    } else {
      fn();
    }
  }

  attachVM() {
    this.workspace.addChangeListener(this.props.vm.blockListener);
    this.flyoutWorkspace = this.workspace.getFlyout().getWorkspace();
    this.flyoutWorkspace.addChangeListener(this.props.vm.flyoutBlockListener);
    this.flyoutWorkspace.addChangeListener(this.props.vm.monitorBlockListener);
    this.props.vm.addListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
    this.props.vm.addListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
    this.props.vm.addListener('BLOCK_GLOW_ON', this.onBlockGlowOn);
    this.props.vm.addListener('BLOCK_GLOW_OFF', this.onBlockGlowOff);
    this.props.vm.addListener('VISUAL_REPORT', this.onVisualReport);
    this.props.vm.addListener('workspaceUpdate', this.onWorkspaceUpdate);
    this.props.vm.addListener('targetsUpdate', this.onTargetsUpdate);
    this.props.vm.addListener('MONITORS_UPDATE', this.handleMonitorsUpdate);
    this.props.vm.addListener('EXTENSION_ADDED', this.handleExtensionAdded);
    this.props.vm.addListener('BLOCKSINFO_UPDATE', this.handleBlocksInfoUpdate);
    this.props.vm.addListener(
      'PERIPHERAL_CONNECTED',
      this.handleStatusButtonUpdate
    );
    this.props.vm.addListener(
      'PERIPHERAL_DISCONNECTED',
      this.handleStatusButtonUpdate
    );
  }
  detachVM() {
    this.props.vm.removeListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
    this.props.vm.removeListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
    this.props.vm.removeListener('BLOCK_GLOW_ON', this.onBlockGlowOn);
    this.props.vm.removeListener('BLOCK_GLOW_OFF', this.onBlockGlowOff);
    this.props.vm.removeListener('VISUAL_REPORT', this.onVisualReport);
    this.props.vm.removeListener('workspaceUpdate', this.onWorkspaceUpdate);
    this.props.vm.removeListener('targetsUpdate', this.onTargetsUpdate);
    this.props.vm.removeListener('MONITORS_UPDATE', this.handleMonitorsUpdate);
    this.props.vm.removeListener('EXTENSION_ADDED', this.handleExtensionAdded);
    this.props.vm.removeListener(
      'BLOCKSINFO_UPDATE',
      this.handleBlocksInfoUpdate
    );
    this.props.vm.removeListener(
      'PERIPHERAL_CONNECTED',
      this.handleStatusButtonUpdate
    );
    this.props.vm.removeListener(
      'PERIPHERAL_DISCONNECTED',
      this.handleStatusButtonUpdate
    );
  }

  updateToolboxBlockValue(id: any, value: any) {
    this.withToolboxUpdates(() => {
      const block = this.workspace.getFlyout().getWorkspace().getBlockById(id);
      if (block) {
        block.inputList[0].fieldRow[0].setValue(value);
      }
    });
  }

  onTargetsUpdate() {
    if (this.props.vm.editingTarget && this.workspace.getFlyout()) {
      ['glide', 'move', 'set'].forEach(prefix => {
        this.updateToolboxBlockValue(
          `${prefix}x`,
          Math.round(this.props.vm.editingTarget.x).toString()
        );
        this.updateToolboxBlockValue(
          `${prefix}y`,
          Math.round(this.props.vm.editingTarget.y).toString()
        );
      });
    }
  }
  onWorkspaceMetricsChange() {
    const target = this.props.vm.editingTarget;
    if (target && target.id) {
      // Dispatch updateMetrics later, since onWorkspaceMetricsChange may be (very indirectly)
      // called from a reducer, i.e. when you create a custom procedure.
      // TODO: Is this a vehement hack?
      setTimeout(() => {
        this.props.updateMetrics({
          targetID: target.id,
          scrollX: this.workspace.scrollX,
          scrollY: this.workspace.scrollY,
          scale: this.workspace.scale,
        });
      }, 0);
    }
  }
  onScriptGlowOn(data: any) {
    this.workspace.glowStack(data.id, true);
  }
  onScriptGlowOff(data: any) {
    this.workspace.glowStack(data.id, false);
  }
  onBlockGlowOn(data: any) {
    this.workspace.glowBlock(data.id, true);
  }
  onBlockGlowOff(data: any) {
    this.workspace.glowBlock(data.id, false);
  }
  onVisualReport(data: any) {
    this.workspace.reportValue(data.id, data.value);
  }
  getToolboxXML() {
    // Use try/catch because this requires digging pretty deep into the VM
    // Code inside intentionally ignores several error situations (no stage, etc.)
    // Because they would get caught by this try/catch
    try {
      let { editingTarget: target, runtime } = this.props.vm;
      const stage = runtime.getTargetForStage();
      if (!target) target = stage; // If no editingTarget, use the stage

      const stageCostumes = stage.getCostumes();
      const targetCostumes = target.getCostumes();
      const targetSounds = target.getSounds();
      const dynamicBlocksXML = this.props.vm.runtime.getBlocksXML(target);
      return makeToolboxXML(
        false,
        target.isStage,
        target.id,
        dynamicBlocksXML,
        targetCostumes[targetCostumes.length - 1].name,
        stageCostumes[stageCostumes.length - 1].name,
        targetSounds.length > 0
          ? targetSounds[targetSounds.length - 1].name
          : ''
      );
    } catch {
      return null;
    }
  }
  onWorkspaceUpdate(data: any) {
    // When we change sprites, update the toolbox to have the new sprite's blocks
    const toolboxXML = this.getToolboxXML();
    if (toolboxXML) {
      this.props.updateToolboxState(toolboxXML);
    }

    if (
      this.props.vm.editingTarget &&
      !this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id]
    ) {
      this.onWorkspaceMetricsChange();
    }

    // Remove and reattach the workspace listener (but allow flyout events)
    this.workspace.removeChangeListener(this.props.vm.blockListener);
    const dom = this.ScratchBlocks.Xml.textToDom(data.xml);
    try {
      this.ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, this.workspace);
    } catch (error: any) {
      // The workspace is likely incomplete. What did update should be
      // functional.
      //
      // Instead of throwing the error, by logging it and continuing as
      // normal lets the other workspace update processes complete in the
      // gui and vm, which lets the vm run even if the workspace is
      // incomplete. Throwing the error would keep things like setting the
      // correct editing target from happening which can interfere with
      // some blocks and processes in the vm.
      if (error.message) {
        error.message = `Workspace Update Error: ${error.message}`;
      }
      log.error(error);
    }
    this.workspace.addChangeListener(this.props.vm.blockListener);

    if (
      this.props.vm.editingTarget &&
      this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id]
    ) {
      const { scrollX, scrollY, scale } =
        this.props.workspaceMetrics.targets[this.props.vm.editingTarget.id];
      this.workspace.scrollX = scrollX;
      this.workspace.scrollY = scrollY;
      this.workspace.scale = scale;
      this.workspace.resize();
    }

    // Clear the undo state of the workspace since this is a
    // fresh workspace and we don't want any changes made to another sprites
    // workspace to be 'undone' here.
    this.workspace.clearUndo();
  }
  handleMonitorsUpdate(monitors: any) {
    // Update the checkboxes of the relevant monitors.
    // TODO: What about monitors that have fields? See todo in scratch-vm blocks.js changeBlock:
    // https://github.com/LLK/scratch-vm/blob/2373f9483edaf705f11d62662f7bb2a57fbb5e28/src/engine/blocks.js#L569-L576
    const flyout = this.workspace.getFlyout();
    for (const monitor of monitors.values()) {
      const blockId = monitor.get('id');
      const isVisible = monitor.get('visible');
      flyout.setCheckboxState(blockId, isVisible);
      // We also need to update the isMonitored flag for this block on the VM, since it's used to determine
      // whether the checkbox is activated or not when the checkbox is re-displayed (e.g. local variables/blocks
      // when switching between sprites).
      const block = this.props.vm.runtime.monitorBlocks.getBlock(blockId);
      if (block) {
        block.isMonitored = isVisible;
      }
    }
  }
  handleExtensionAdded(categoryInfo: any) {
    const defineBlocks = (blockInfoArray: any) => {
      if (blockInfoArray && blockInfoArray.length > 0) {
        const staticBlocksJson: any = [];
        const dynamicBlocksInfo: any = [];
        blockInfoArray.forEach((blockInfo: any) => {
          if (blockInfo.info && blockInfo.info.isDynamic) {
            dynamicBlocksInfo.push(blockInfo);
          } else if (blockInfo.json) {
            staticBlocksJson.push(blockInfo.json);
          }
          // otherwise it's a non-block entry such as '---'
        });

        this.ScratchBlocks.defineBlocksWithJsonArray(staticBlocksJson);
        dynamicBlocksInfo.forEach((blockInfo: any) => {
          // This is creating the block factory / constructor -- NOT a specific instance of the block.
          // The factory should only know static info about the block: the category info and the opcode.
          // Anything else will be picked up from the XML attached to the block instance.
          const extendedOpcode = `${categoryInfo.id}_${blockInfo.info.opcode}`;
          const blockDefinition = defineDynamicBlock(
            this.ScratchBlocks,
            categoryInfo,
            blockInfo,
            extendedOpcode
          );
          this.ScratchBlocks.Blocks[extendedOpcode] = blockDefinition;
        });
      }
    };

    // scratch-blocks implements a menu or custom field as a special kind of block ("shadow" block)
    // these actually define blocks and MUST run regardless of the UI state
    defineBlocks(
      Object.getOwnPropertyNames(categoryInfo.customFieldTypes).map(
        fieldTypeName =>
          categoryInfo.customFieldTypes[fieldTypeName].scratchBlocksDefinition
      )
    );
    defineBlocks(categoryInfo.menus);
    defineBlocks(categoryInfo.blocks);

    // Update the toolbox with new blocks if possible
    const toolboxXML = this.getToolboxXML();
    if (toolboxXML) {
      this.props.updateToolboxState(toolboxXML);
    }
  }
  handleBlocksInfoUpdate(categoryInfo: any) {
    // @todo Later we should replace this to avoid all the warnings from redefining blocks.
    this.handleExtensionAdded(categoryInfo);
  }
  handleCategorySelected(categoryId: any) {
    const extension = extensionData.find(
      (ext: any) => ext.extensionId === categoryId
    );
    if (extension && extension.launchPeripheralConnectionFlow) {
      this.handleConnectionModalStart(categoryId);
    }

    this.withToolboxUpdates(() => {
      this.workspace.toolbox_.setSelectedCategoryById(categoryId);
    });
  }
  setBlocks(blocks: any) {
    this.blocks = blocks;
  }
  handlePromptStart(
    message: any,
    defaultValue: any,
    callback: any,
    optTitle: any,
    optVarType: any
  ) {
    const p: any = { prompt: { callback, message, defaultValue } };
    p.prompt.title = optTitle
      ? optTitle
      : this.ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;
    p.prompt.varType =
      typeof optVarType === 'string'
        ? optVarType
        : this.ScratchBlocks.SCALAR_VARIABLE_TYPE;
    p.prompt.showVariableOptions = // This flag means that we should show variable/list options about scope
      optVarType !== this.ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE &&
      p.prompt.title !== this.ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE &&
      p.prompt.title !== this.ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;
    p.prompt.showCloudOption =
      optVarType === this.ScratchBlocks.SCALAR_VARIABLE_TYPE &&
      this.props.canUseCloud;
    this.setState(p);
  }
  handleConnectionModalStart(extensionId: any) {
    this.props.onOpenConnectionModal(extensionId);
  }
  handleStatusButtonUpdate() {
    this.ScratchBlocks.refreshStatusButtons(this.workspace);
  }
  handleOpenSoundRecorder() {
    this.props.onOpenSoundRecorder();
  }

  /*
   * Pass along information about proposed name and variable options (scope and isCloud)
   * and additional potentially conflicting variable names from the VM
   * to the variable validation prompt callback used in scratch-blocks.
   */
  handlePromptCallback(input: any, variableOptions: any) {
    this.state.prompt.callback(
      input,
      this.props.vm.runtime.getAllVarNamesOfType(this.state.prompt.varType),
      variableOptions
    );
    this.handlePromptClose();
  }
  handlePromptClose() {
    this.setState({ prompt: null });
  }
  handleCustomProceduresClose(data: any) {
    this.props.onRequestCloseCustomProcedures(data);
    const ws = this.workspace;
    ws.refreshToolboxSelection_();
    ws.toolbox_.scrollToCategoryById('myBlocks');
  }
  handleDrop(dragInfo: any) {
    fetch(dragInfo.payload.bodyUrl)
      .then(response => response.json())
      .then(blocks =>
        this.props.vm.shareBlocksToTarget(
          blocks,
          this.props.vm.editingTarget.id
        )
      )
      .then(() => {
        this.props.vm.refreshWorkspace();
        this.updateToolbox(); // To show new variables/custom blocks
      });
  }
  render() {
    /* eslint-disable no-unused-vars */
    const {
      anyModalVisible,
      canUseCloud,
      customProceduresVisible,
      extensionLibraryVisible,
      options,
      stageSize,
      vm,
      isRtl,
      isVisible,
      onActivateColorPicker,
      onOpenConnectionModal,
      onOpenSoundRecorder,
      updateToolboxState,
      onActivateCustomProcedures,
      onRequestCloseExtensionLibrary,
      onRequestCloseCustomProcedures,
      toolboxXML,
      updateMetrics: updateMetricsProp,
      workspaceMetrics,
      ...props
    } = this.props;
    /* eslint-enable no-unused-vars */
    return (
      <React.Fragment>
        <DroppableBlocks
          componentRef={this.setBlocks}
          onDrop={this.handleDrop}
          {...props}
        />
        {this.state.prompt ? (
          <Prompt
            defaultValue={this.state.prompt.defaultValue}
            isStage={vm.runtime.getEditingTarget().isStage}
            showListMessage={
              this.state.prompt.varType ===
              this.ScratchBlocks.LIST_VARIABLE_TYPE
            }
            label={this.state.prompt.message}
            showCloudOption={this.state.prompt.showCloudOption}
            showVariableOptions={this.state.prompt.showVariableOptions}
            title={this.state.prompt.title}
            vm={vm}
            onCancel={this.handlePromptClose}
            onOk={this.handlePromptCallback}
          />
        ) : null}
        {extensionLibraryVisible ? (
          <ExtensionLibrary
            vm={vm}
            onCategorySelected={this.handleCategorySelected}
            onRequestClose={onRequestCloseExtensionLibrary}
            visible={boolean}
          />
        ) : null}
        {customProceduresVisible ? (
          <CustomProcedures
            options={{
              media: options.media,
            }}
            onRequestClose={this.handleCustomProceduresClose}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

// TODO Functional Component
// let ScratchBlocks
// const Blocks = ({onActivateColorPicker, onActivateCustomProcedures, locale, options, isRtl, toolboxXML, isVisible, anyModalVisible, stageSize, vm, messages, updateMetrics: updateMetricBlock, updateToolboxState, workspaceMetrics, canUseCloud, onOpenConnectionModal, onOpenSoundRecorder, onRequestCloseCustomProcedures, props, onRequestCloseExtensionLibrary,onRequestCloseCustomProcedures, customProceduresVisible}) => {
//     ScratchBlocks = VMScratchBlocks(vm);
//     ScratchBlocks.prompt = handlePromptStart;
//     ScratchBlocks.statusButtonCallback = handleConnectionModalStart;
//     ScratchBlocks.recordSoundCallback = handleOpenSoundRecorder;
//     const [states, setStates] = useState({
//         prompt: null
//     });
//     const [anyModalVisibleState, setAnyModalVisibleState] = useState(null);
//     const [isVisibleState, setIsVisibleState] = useState(null);
//     const [stageSizeState, setStageSizeState] = useState(null);
//     const [localeState, setLocaleState] = useState(null);

//     onTargetsUpdate = debounce(onTargetsUpdate, 100);
//     let toolboxUpdateQueue = [];
//     let toolboxUpdateTimeout;

//     useEffect(() => {
//         ScratchBlocks.FieldColourSlider.activateEyedropper_ = onActivateColorPicker;
//         ScratchBlocks.Procedures.externalProcedureDefCallback = onActivateCustomProcedures;
//         ScratchBlocks.ScratchMsgs.setLocale(locale);

//         const workspaceConfig = defaultsDeep({},
//             Blocks.defaultOptions,
//             options,
//             {rtl: isRtl, toolbox: toolboxXML}
//         );
//         workspace = ScratchBlocks.inject(blocks, workspaceConfig);

//         // Register buttons under new callback keys for creating variables,
//         // lists, and procedures from extensions.

//         const toolboxWorkspace = workspace.getFlyout().getWorkspace();

//         const varListButtonCallback = type =>
//             (() => ScratchBlocks.Variables.createVariable(workspace, null, type));
//         const procButtonCallback = () => {
//             ScratchBlocks.Procedures.createProcedureDefCallback_(workspace);
//         };

//         toolboxWorkspace.registerButtonCallback('MAKE_A_VARIABLE', varListButtonCallback(''));
//         toolboxWorkspace.registerButtonCallback('MAKE_A_LIST', varListButtonCallback('list'));
//         toolboxWorkspace.registerButtonCallback('MAKE_A_PROCEDURE', procButtonCallback);

//         // Store the xml of the toolbox that is actually rendered.
//         // This is used in componentDidUpdate instead of prevProps, because
//         // the xml can change while e.g. on the costumes tab.
//         _renderedToolboxXML = toolboxXML;

//         // we actually never want the workspace to enable "refresh toolbox" - this basically re-renders the
//         // entire toolbox every time we reset the workspace.  We call updateToolbox as a part of
//         // componentDidUpdate so the toolbox will still correctly be updated
//         setToolboxRefreshEnabled = workspace.setToolboxRefreshEnabled.bind(workspace);
//         workspace.setToolboxRefreshEnabled = () => {
//             setToolboxRefreshEnabled(false);
//         };

//         // @todo change this when blockly supports UI events
//         addFunctionListener(workspace, 'translate', onWorkspaceMetricsChange);
//         addFunctionListener(workspace, 'zoom', onWorkspaceMetricsChange);

//         attachVM();
//         // Only update blocks/vm locale when visible to avoid sizing issues
//         // If locale changes while not visible it will get handled in didUpdate
//         if (isVisible) {
//             setLocale();
//         }

//       return () => {
//         detachVM();
//         workspace.dispose();
//         clearTimeout(toolboxUpdateTimeout);
//       }
//     }, []);

//     useEffect(() => {

//         // If any modals are open, call hideChaff to close z-indexed field editors
//         if (anyModalVisible && !anyModalVisibleState) {
//             ScratchBlocks.hideChaff();
//             setAnyModalVisibleState(anyModalVisible);
//         }

//         // Only rerender the toolbox when the blocks are visible and the xml is
//         // different from the previously rendered toolbox xml.
//         // Do not check against prevProps.toolboxXML because that may not have been rendered.
//         if (isVisible && toolboxXML !== _renderedToolboxXML) {
//             requestToolboxUpdate();
//         }

//         if (isVisible === isVisibleState) {
//             setIsVisibleState(isVisible);
//             if (stageSize !== stageSizeState) {
//                 // force workspace to redraw for the new stage size
//                 window.dispatchEvent(new Event('resize'));
//                 setStageSizeState(stageSize);
//             }
//             return;
//         }
//         // @todo hack to resize blockly manually in case resize happened while hidden
//         // @todo hack to reload the workspace due to gui bug #413
//         if (isVisible) { // Scripts tab
//             workspace.setVisible(true);
//             if (localeState !== locale || locale !== vm.getLocale()) {
//                 // call setLocale if the locale has changed, or changed while the blocks were hidden.
//                 // vm.getLocale() will be out of sync if locale was changed while not visible
//                 setLocale();
//                 setLocaleState(locale)
//             } else {
//                 vm.refreshWorkspace();
//                 requestToolboxUpdate();
//             }

//             window.dispatchEvent(new Event('resize'));
//         } else {
//             workspace.setVisible(false);
//         }

//     }, [anyModalVisible, isVisible, toolboxXML, _renderedToolboxXML, stageSize, locale, vm.getLocale]);

//     const requestToolboxUpdate = () => {
//         clearTimeout(toolboxUpdateTimeout);
//         toolboxUpdateTimeout = setTimeout(() => {
//             updateToolbox();
//         }, 0);
//     }
//     const setLocale = () => {
//         ScratchBlocks.ScratchMsgs.setLocale(locale);
//         vm.setLocale(locale, messages)
//             .then(() => {
//                 workspace.getFlyout().setRecyclingEnabled(false);
//                 vm.refreshWorkspace();
//                 requestToolboxUpdate();
//                 withToolboxUpdates(() => {
//                    workspace.getFlyout().setRecyclingEnabled(true);
//                 });
//             });
//     }

//     const updateToolbox = () => {
//         toolboxUpdateTimeout = false;

//         const categoryId = workspace.toolbox_.getSelectedCategoryId();
//         const offset = workspace.toolbox_.getCategoryScrollOffset();
//         workspace.updateToolbox(toolboxXML);
//         _renderedToolboxXML = toolboxXML;

//         // In order to catch any changes that mutate the toolbox during "normal runtime"
//         // (variable changes/etc), re-enable toolbox refresh.
//         // Using the setter function will rerender the entire toolbox which we just rendered.
//         workspace.toolboxRefreshEnabled_ = true;

//         const currentCategoryPos = workspace.toolbox_.getCategoryPositionById(categoryId);
//         const currentCategoryLen = workspace.toolbox_.getCategoryLengthById(categoryId);
//         if (offset < currentCategoryLen) {
//             workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos + offset);
//         } else {
//             workspace.toolbox_.setFlyoutScrollPos(currentCategoryPos);
//         }

//         const queue = toolboxUpdateQueue;
//         toolboxUpdateQueue = [];
//         queue.forEach(fn => fn());
//     }

//     const withToolboxUpdates = (fn) => {
//         // if there is a queued toolbox update, we need to wait
//         if (toolboxUpdateTimeout) {
//             toolboxUpdateQueue.push(fn);
//         } else {
//             fn();
//         }
//     }

//     const attachVM = () => {
//         workspace.addChangeListener(vm.blockListener);
//         flyoutWorkspace = workspace
//             .getFlyout()
//             .getWorkspace();
//         flyoutWorkspace.addChangeListener(vm.flyoutBlockListener);
//         flyoutWorkspace.addChangeListener(vm.monitorBlockListener);
//         vm.addListener('SCRIPT_GLOW_ON', onScriptGlowOn);
//         vm.addListener('SCRIPT_GLOW_OFF', onScriptGlowOff);
//         vm.addListener('BLOCK_GLOW_ON', onBlockGlowOn);
//         vm.addListener('BLOCK_GLOW_OFF', onBlockGlowOff);
//         vm.addListener('VISUAL_REPORT', onVisualReport);
//         vm.addListener('workspaceUpdate', onWorkspaceUpdate);
//         vm.addListener('targetsUpdate', onTargetsUpdate);
//         vm.addListener('MONITORS_UPDATE', handleMonitorsUpdate);
//         vm.addListener('EXTENSION_ADDED', handleExtensionAdded);
//         vm.addListener('BLOCKSINFO_UPDATE', handleBlocksInfoUpdate);
//         vm.addListener('PERIPHERAL_CONNECTED', handleStatusButtonUpdate);
//         vm.addListener('PERIPHERAL_DISCONNECTED', handleStatusButtonUpdate);
//     }
//     const detachVM = () => {
//         vm.removeListener('SCRIPT_GLOW_ON', onScriptGlowOn);
//         vm.removeListener('SCRIPT_GLOW_OFF', onScriptGlowOff);
//         vm.removeListener('BLOCK_GLOW_ON', onBlockGlowOn);
//         vm.removeListener('BLOCK_GLOW_OFF', onBlockGlowOff);
//         vm.removeListener('VISUAL_REPORT', onVisualReport);
//         vm.removeListener('workspaceUpdate', onWorkspaceUpdate);
//         vm.removeListener('targetsUpdate', onTargetsUpdate);
//         vm.removeListener('MONITORS_UPDATE', handleMonitorsUpdate);
//         vm.removeListener('EXTENSION_ADDED', handleExtensionAdded);
//         vm.removeListener('BLOCKSINFO_UPDATE', handleBlocksInfoUpdate);
//         vm.removeListener('PERIPHERAL_CONNECTED', handleStatusButtonUpdate);
//         vm.removeListener('PERIPHERAL_DISCONNECTED', handleStatusButtonUpdate);
//     }

//     const updateToolboxBlockValue = (id, value) => {
//         withToolboxUpdates(() => {
//             const block = workspace
//                 .getFlyout()
//                 .getWorkspace()
//                 .getBlockById(id);
//             if (block) {
//                 block.inputList[0].fieldRow[0].setValue(value);
//             }
//         });
//     }

//     const onTargetsUpdate = () => {
//         if (vm.editingTarget && workspace.getFlyout()) {
//             ['glide', 'move', 'set'].forEach(prefix => {
//                 updateToolboxBlockValue(`${prefix}x`, Math.round(vm.editingTarget.x).toString());
//                 updateToolboxBlockValue(`${prefix}y`, Math.round(vm.editingTarget.y).toString());
//             });
//         }
//     }
//     const onWorkspaceMetricsChange = () => {
//         const target = vm.editingTarget;
//         if (target && target.id) {
//             // Dispatch updateMetrics later, since onWorkspaceMetricsChange may be (very indirectly)
//             // called from a reducer, i.e. when you create a custom procedure.
//             // TODO: Is this a vehement hack?
//             setTimeout(() => {
//                 updateMetricBlock({
//                     targetID: target.id,
//                     scrollX: workspace.scrollX,
//                     scrollY: workspace.scrollY,
//                     scale: workspace.scale
//                 });
//             }, 0);
//         }
//     }
//     const onScriptGlowOn = (data) => {
//         workspace.glowStack(data.id, true);
//     }
//     const onScriptGlowOff = (data) => {
//         workspace.glowStack(data.id, false);
//     }
//     const onBlockGlowOn = (data) => {
//         workspace.glowBlock(data.id, true);
//     }
//     const onBlockGlowOff = (data) => {
//         workspace.glowBlock(data.id, false);
//     }
//     const onVisualReport = (data) => {
//         workspace.reportValue(data.id, data.value);
//     }
//     const getToolboxXML = () => {
//         // Use try/catch because this requires digging pretty deep into the VM
//         // Code inside intentionally ignores several error situations (no stage, etc.)
//         // Because they would get caught by this try/catch
//         try {
//             let {editingTarget: target, runtime} = vm;
//             const stage = runtime.getTargetForStage();
//             if (!target) target = stage; // If no editingTarget, use the stage

//             const stageCostumes = stage.getCostumes();
//             const targetCostumes = target.getCostumes();
//             const targetSounds = target.getSounds();
//             const dynamicBlocksXML = vm.runtime.getBlocksXML(target);
//             return makeToolboxXML(false, target.isStage, target.id, dynamicBlocksXML,
//                 targetCostumes[targetCostumes.length - 1].name,
//                 stageCostumes[stageCostumes.length - 1].name,
//                 targetSounds.length > 0 ? targetSounds[targetSounds.length - 1].name : ''
//             );
//         } catch {
//             return null;
//         }
//     }
//     const onWorkspaceUpdate = (data) => {
//         // When we change sprites, update the toolbox to have the new sprite's blocks
//         const toolboxXMLUpdate = getToolboxXML();
//         if (toolboxXMLUpdate) {
//             updateToolboxState(toolboxXMLUpdate);
//         }

//         if (vm.editingTarget && !workspaceMetrics.targets[vm.editingTarget.id]) {
//             onWorkspaceMetricsChange();
//         }

//         // Remove and reattach the workspace listener (but allow flyout events)
//         workspace.removeChangeListener(vm.blockListener);
//         const dom = ScratchBlocks.Xml.textToDom(data.xml);
//         try {
//             ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
//         } catch (error) {
//             // The workspace is likely incomplete. What did update should be
//             // functional.
//             //
//             // Instead of throwing the error, by logging it and continuing as
//             // normal lets the other workspace update processes complete in the
//             // gui and vm, which lets the vm run even if the workspace is
//             // incomplete. Throwing the error would keep things like setting the
//             // correct editing target from happening which can interfere with
//             // some blocks and processes in the vm.
//             if (error.message) {
//                 error.message = `Workspace Update Error: ${error.message}`;
//             }
//             log.error(error);
//         }
//         workspace.addChangeListener(vm.blockListener);

//         if (vm.editingTarget && workspaceMetrics.targets[vm.editingTarget.id]) {
//             const {scrollX, scrollY, scale} = workspaceMetrics.targets[vm.editingTarget.id];
//             workspace.scrollX = scrollX;
//             workspace.scrollY = scrollY;
//             workspace.scale = scale;
//             workspace.resize();
//         }

//         // Clear the undo state of the workspace since this is a
//         // fresh workspace and we don't want any changes made to another sprites
//         // workspace to be 'undone' here.
//         workspace.clearUndo();
//     }
//     const handleMonitorsUpdate = (monitors) => {
//         // Update the checkboxes of the relevant monitors.
//         // TODO: What about monitors that have fields? See todo in scratch-vm blocks.js changeBlock:
//         // https://github.com/LLK/scratch-vm/blob/2373f9483edaf705f11d62662f7bb2a57fbb5e28/src/engine/blocks.js#L569-L576
//         const flyout = workspace.getFlyout();
//         for (const monitor of monitors.values()) {
//             const blockId = monitor.get('id');
//             const isVisibleUpdate = monitor.get('visible');
//             flyout.setCheckboxState(blockId, isVisibleUpdate);
//             // We also need to update the isMonitored flag for this block on the VM, since it's used to determine
//             // whether the checkbox is activated or not when the checkbox is re-displayed (e.g. local variables/blocks
//             // when switching between sprites).
//             const block = vm.runtime.monitorBlocks.getBlock(blockId);
//             if (block) {
//                 block.isMonitored = isVisibleUpdate;
//             }
//         }
//     }
//     const handleExtensionAdded = (categoryInfo) => {
//         const defineBlocks = blockInfoArray => {
//             if (blockInfoArray && blockInfoArray.length > 0) {
//                 const staticBlocksJson = [];
//                 const dynamicBlocksInfo = [];
//                 blockInfoArray.forEach(blockInfo => {
//                     if (blockInfo.info && blockInfo.info.isDynamic) {
//                         dynamicBlocksInfo.push(blockInfo);
//                     } else if (blockInfo.json) {
//                         staticBlocksJson.push(blockInfo.json);
//                     }
//                     // otherwise it's a non-block entry such as '---'
//                 });

//                 ScratchBlocks.defineBlocksWithJsonArray(staticBlocksJson);
//                 dynamicBlocksInfo.forEach(blockInfo => {
//                     // This is creating the block factory / constructor -- NOT a specific instance of the block.
//                     // The factory should only know static info about the block: the category info and the opcode.
//                     // Anything else will be picked up from the XML attached to the block instance.
//                     const extendedOpcode = `${categoryInfo.id}_${blockInfo.info.opcode}`;
//                     const blockDefinition =
//                         defineDynamicBlock(ScratchBlocks, categoryInfo, blockInfo, extendedOpcode);
//                     ScratchBlocks.Blocks[extendedOpcode] = blockDefinition;
//                 });
//             }
//         };

//         // scratch-blocks implements a menu or custom field as a special kind of block ("shadow" block)
//         // these actually define blocks and MUST run regardless of the UI state
//         defineBlocks(
//             Object.getOwnPropertyNames(categoryInfo.customFieldTypes)
//                 .map(fieldTypeName => categoryInfo.customFieldTypes[fieldTypeName].scratchBlocksDefinition));
//         defineBlocks(categoryInfo.menus);
//         defineBlocks(categoryInfo.blocks);

//         // Update the toolbox with new blocks if possible
//         const toolboxXML = getToolboxXML();
//         if (toolboxXML) {
//             updateToolboxState(toolboxXML);
//         }
//     }
//     const handleBlocksInfoUpdate = (categoryInfo) => {
//         // @todo Later we should replace this to avoid all the warnings from redefining blocks.
//         handleExtensionAdded(categoryInfo);
//     }
//     const handleCategorySelected = (categoryId) => {
//         const extension = extensionData.find(ext => ext.extensionId === categoryId);
//         if (extension && extension.launchPeripheralConnectionFlow) {
//             handleConnectionModalStart(categoryId);
//         }

//         withToolboxUpdates(() => {
//             workspace.toolbox_.setSelectedCategoryById(categoryId);
//         });
//     }
//     const setBlocks = (blocks) => {
//         blocks = blocks;
//     }
//     const handlePromptStart = (messagePrompt, defaultValue, callback, optTitle, optVarType) => {
//         const p = {prompt: {callback, messagePrompt, defaultValue}};
//         p.prompt.title = optTitle ? optTitle :
//             ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;
//         p.prompt.varType = typeof optVarType === 'string' ?
//             optVarType : ScratchBlocks.SCALAR_VARIABLE_TYPE;
//         p.prompt.showVariableOptions = // This flag means that we should show variable/list options about scope
//             optVarType !== ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE &&
//             p.prompt.title !== ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE &&
//             p.prompt.title !== ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;
//         p.prompt.showCloudOption = (optVarType === ScratchBlocks.SCALAR_VARIABLE_TYPE) && canUseCloud;
//         setStates(...states, p);
//     }
//     const handleConnectionModalStart = (extensionId) => {
//         onOpenConnectionModal(extensionId);
//     }
//     const handleStatusButtonUpdate = () => {
//         ScratchBlocks.refreshStatusButtons(workspace);
//     }
//     const handleOpenSoundRecorder = () => {
//         onOpenSoundRecorder();
//     }

//     /*
//      * Pass along information about proposed name and variable options (scope and isCloud)
//      * and additional potentially conflicting variable names from the VM
//      * to the variable validation prompt callback used in scratch-blocks.
//      */
//     const handlePromptCallback = (input, variableOptions) => {
//         states.prompt.callback(
//             input,
//             vm.runtime.getAllVarNamesOfType(states.prompt.varType),
//             variableOptions);
//         handlePromptClose();
//     }
//     const handlePromptClose = () => {
//         setStates({prompt: null});
//     }
//     const handleCustomProceduresClose = (data) => {
//         onRequestCloseCustomProcedures(data);
//         const ws = workspace;
//         ws.refreshToolboxSelection_();
//         ws.toolbox_.scrollToCategoryById('myBlocks');
//     }
//     const handleDrop = (dragInfo) => {
//         fetch(dragInfo.payload.bodyUrl)
//             .then(response => response.json())
//             .then(blocks => vm.shareBlocksToTarget(blocks, vm.editingTarget.id))
//             .then(() => {
//                 vm.refreshWorkspace();
//                 updateToolbox(); // To show new variables/custom blocks
//             });
//     }

//     return (
//             <React.Fragment>
//                 <DroppableBlocks
//                     componentRef={setBlocks}
//                     onDrop={handleDrop}
//                     {...props}
//                 />
//                 {states.prompt ? (
//                     <Prompt
//                         defaultValue={states.prompt.defaultValue}
//                         isStage={vm.runtime.getEditingTarget().isStage}
//                         showListMessage={states.prompt.varType === ScratchBlocks.LIST_VARIABLE_TYPE}
//                         label={states.prompt.message}
//                         showCloudOption={states.prompt.showCloudOption}
//                         showVariableOptions={states.prompt.showVariableOptions}
//                         title={states.prompt.title}
//                         vm={vm}
//                         onCancel={handlePromptClose}
//                         onOk={handlePromptCallback}
//                     />
//                 ) : null}
//                 {extensionLibraryVisible ? (
//                     <ExtensionLibrary
//                         vm={vm}
//                         onCategorySelected={handleCategorySelected}
//                         onRequestClose={onRequestCloseExtensionLibrary}
//                     />
//                 ) : null}
//                 {customProceduresVisible ? (
//                     <CustomProcedures
//                         options={{
//                             media: options.media
//                         }}
//                         onRequestClose={handleCustomProceduresClose}
//                     />
//                 ) : null}
//             </React.Fragment>
//         );
// };

interface PropsInterface {
  anyModalVisible: boolean;
  canUseCloud: boolean;
  customProceduresVisible: boolean;
  extensionLibraryVisible: boolean;
  isRtl: boolean;
  isVisible: boolean;
  locale: string;
  messages: any;
  onActivateColorPicker: any;
  onActivateCustomProcedures: any;
  onOpenConnectionModal: any;
  onOpenSoundRecorder: any;
  onRequestCloseCustomProcedures: any;
  onRequestCloseExtensionLibrary: any;
  options: any;
  stageSize: any;
  toolboxXML: string;
  updateMetrics: any;
  updateToolboxState: any;
  vm: any;
  workspaceMetrics: any;
}

interface StateInterface {
  prompt: any;
}

// TODO
// Blocks.propTypes = {
//   anyModalVisible: PropTypes.bool,
//   canUseCloud: PropTypes.bool,
//   customProceduresVisible: PropTypes.bool,
//   extensionLibraryVisible: PropTypes.bool,
//   isRtl: PropTypes.bool,
//   isVisible: PropTypes.bool,
//   locale: PropTypes.string.isRequired,
//   messages: PropTypes.objectOf(PropTypes.string),
//   onActivateColorPicker: PropTypes.func,
//   onActivateCustomProcedures: PropTypes.func,
//   onOpenConnectionModal: PropTypes.func,
//   onOpenSoundRecorder: PropTypes.func,
//   onRequestCloseCustomProcedures: PropTypes.func,
//   onRequestCloseExtensionLibrary: PropTypes.func,
//   options: PropTypes.shape({
//     media: PropTypes.string,
//     zoom: PropTypes.shape({
//       controls: PropTypes.bool,
//       wheel: PropTypes.bool,
//       startScale: PropTypes.number,
//     }),
//     colours: PropTypes.shape({
//       workspace: PropTypes.string,
//       flyout: PropTypes.string,
//       toolbox: PropTypes.string,
//       toolboxSelected: PropTypes.string,
//       scrollbar: PropTypes.string,
//       scrollbarHover: PropTypes.string,
//       insertionMarker: PropTypes.string,
//       insertionMarkerOpacity: PropTypes.number,
//       fieldShadow: PropTypes.string,
//       dragShadowOpacity: PropTypes.number,
//     }),
//     comments: PropTypes.bool,
//     collapse: PropTypes.bool,
//   }),
//   stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
//   toolboxXML: PropTypes.string,
//   updateMetrics: PropTypes.func,
//   updateToolboxState: PropTypes.func,
//   vm: PropTypes.instanceOf(VM).isRequired,
//   workspaceMetrics: PropTypes.shape({
//     targets: PropTypes.objectOf(PropTypes.object),
//   }),
// };

Blocks.defaultOptions = {
  zoom: {
    controls: true,
    wheel: true,
    startScale: BLOCKS_DEFAULT_SCALE,
  },
  grid: {
    spacing: 40,
    length: 2,
    colour: '#ddd',
  },
  colours: {
    workspace: '#F9F9F9',
    flyout: '#F9F9F9',
    toolbox: '#FFFFFF',
    toolboxSelected: '#E9EEF2',
    scrollbar: '#CECDCE',
    scrollbarHover: '#CECDCE',
    insertionMarker: '#000000',
    insertionMarkerOpacity: 0.2,
    fieldShadow: 'rgba(255, 255, 255, 0.3)',
    dragShadowOpacity: 0.6,
  },
  comments: true,
  collapse: false,
  sounds: false,
};

Blocks.defaultProps = {
  isVisible: true,
  options: Blocks.defaultOptions,
};

const mapStateToProps = (state: any) => ({
  anyModalVisible:
    Object.keys(state.scratchGui.modals).some(
      key => state.scratchGui.modals[key]
    ) || state.scratchGui.mode.isFullScreen,
  extensionLibraryVisible: state.scratchGui.modals.extensionLibrary,
  isRtl: state.locales.isRtl,
  locale: state.locales.locale,
  messages: state.locales.messages,
  toolboxXML: state.scratchGui.toolbox.toolboxXML,
  customProceduresVisible: state.scratchGui.customProcedures.active,
  workspaceMetrics: state.scratchGui.workspaceMetrics,
});

const mapDispatchToProps = (dispatch: any) => ({
  onActivateColorPicker: (callback: any) =>
    dispatch(activateColorPicker(callback)),
  onActivateCustomProcedures: (data: any, callback: any) =>
    dispatch(activateCustomProcedures(data, callback)),
  onOpenConnectionModal: (id: any) => {
    dispatch(setConnectionModalExtensionId(id));
    dispatch(openConnectionModal());
  },
  onOpenSoundRecorder: () => {
    dispatch(activateTab(SOUNDS_TAB_INDEX));
    dispatch(openSoundRecorder());
  },
  onRequestCloseExtensionLibrary: () => {
    dispatch(closeExtensionLibrary());
  },
  onRequestCloseCustomProcedures: (data: any) => {
    dispatch(deactivateCustomProcedures(data));
  },
  updateToolboxState: (toolboxXML: any) => {
    dispatch(updateToolbox(toolboxXML));
  },
  updateMetrics: (metrics: any) => {
    dispatch(updateMetrics(metrics));
  },
});

export default errorBoundaryHOC('Blocks')(
  connect(mapStateToProps, mapDispatchToProps)(Blocks)
);

// TODO For functional component
// export default React.memo(
//   errorBoundaryHOC('Blocks')(
//     connect(mapStateToProps, mapDispatchToProps)(Blocks)
//   ),
//   areEqual
// );

// Utility functions for updating variables in the VM
// TODO (VM#1145) these should be moved to top-level VM API
const getVariable = (vm: any, targetId: any, variableId: any) => {
  const target = targetId
    ? vm.runtime.getTargetById(targetId)
    : vm.runtime.getTargetForStage();
  return target.variables[variableId];
};

const getVariableValue = (vm: any, targetId: any, variableId: any) => {
  const variable = getVariable(vm, targetId, variableId);
  // If array, return a new copy for mutating, ensuring that updates stay immutable.
  if (variable.value instanceof Array) return variable.value.slice();
  return variable.value;
};

const setVariableValue = (
  vm: any,
  targetId: any,
  variableId: any,
  value: any
) => {
  getVariable(vm, targetId, variableId).value = value;
};

export { getVariable, getVariableValue, setVariableValue };

# React Flow Modeler

[![npm version][npm-image]][npm-url]
![Build Status][github-action-image]

Introducing a component for viewing/editing simple flow-charts but with the ability to easily customise the contents of the "task" elements.

The layout is handled through CSS `grid` which avoids error-prone pixel calculations.
The limited flexibility is accepted and even desired to concentrate on the more important content while still achieving a uniform design.

## Demo

Have a look at the [![Storybook][storybook-image]][storybook-url]

## Usage

### Installation from NPM

```shell
npm i react-flow-modeler
```

### React Component Props of `<FlowModeler>`

#### `flow` (required)
Describing the whole data model being displayed, expecting an object with two fields:
- `flow.firstElementId` – string containing the key to the `flow.elements` entry, that should follow the start node
- `flow.elements` – object containing all "step" nodes and "diverging gateway" nodes as values
  - "step" nodes are represented by an object that may contain the following fields:
    - `data` – object in which any kind of additional information may be stored (in order to consider it in the `renderStep` function
    - `nextElementId` – string containing the key to the `flow.elements` entry, that should follow this step (if omitted or without matching entry in `flow.elements`, it will point to the end node)
  - "diverging gateway" nodes are represented by an object that may contain the following fields:
    - `data` – object in which any kind of additional information may be stored (in order to consider it in the `renderGatewayConditionType` function
    - `nextElements` (required, otherwise it is treated as "step" node) – array of branches from this gateway, each branch being represented by an object with the following fields:
      - `conditionData` – object in which any kind of additional information may be stored (in order to consider it in the `renderGatewayConditionValue` function
      - `id` – string containing the key to the `flow.elements` entry, that should follow this gateway branch (if omitted or without matching entry in `flow.elements`, it will point to the end node)

#### `options`
Currently only catering for one setting:
- `verticalAlign` – either `"top"`, `"middle"` or `"bottom"`; with `"middle"` being the default

#### `renderStep` (required)
Render function for a "step" element expecting a react element to be returned based on a single input object containing mainly the following fields:
- `type` – string of fixed value `"step"`
- `id` – string containing the key to the corresponding `flow.elements` entry
- `data` – the provided `data` object, also available under `flow.elements[id].data`
- `precedingElement` – reference to the directly preceding element in the flow
- `followingElement` – reference to the directly following element in the flow

#### `renderGatewayConditionType`
Render function for the condition label following a diverging gateway expecting a react element to be returned based on a single input object containing mainly the following fields:
- `type` – string of fixed value `"div-gw"`
- `id` – string containing the key to the corresponding `flow.elements` entry
- `data` – the provided `data` object, also available under `flow.elements[id].data`
- `precedingElement` – reference to the directly preceding element in the flow
- `followingBranches` – reference to the associated following branches in the flow

#### `renderGatewayConditionValue`
Render function for the condition label on a branch from a diverging gateway expecting a react element to be returned based on a single input object containing mainly the following fields:
- `type` – string of fixed value `"div-branch"`
- `branchIndex` – string containing the key to the corresponding `flow.elements` entry
- `data` – the provided `data` object, also available under `flow.elements[precedingElement.id].nextElements[branchIndex].conditionData`
- `precedingElement` – reference to the directly preceding diverging gateway in the flow
- `followingElement` – reference to the directly following element in the flow

#### `onChange`
Callback function that when present enables structural editing, receiving a single input object containing the following field:
- `changedFlow` – updated `flow` that should be stored in some external state and provided again via the `flow` prop

#### `editActions`
Object containing various customization options for the structural editing feature in the following fields:
- `addDivergingBranch` – object for customizing the adding of branches to a diverging gateway, expecting any of the following fields:
  - `className` – string overriding the default `"menu-item add-branch"` css classes on the corresponding context menu item
  - `title` – string defining the tool-tip to show for the corresponding context menu item
  - `isActionAllowed` – function for preventing adding branches to certain gateway, expecting a `boolean` to be returned based on the same single input object as on `renderGatewayConditionType` referring to the selected element
  - `getBranchConditionData` – function for providing the default `conditionData` on a newly added diverging gateway branch based on the same single input object as on `renderGatewayConditionType`
- `addFollowingStepElement` – object for customizing the adding of step nodes, expecting any of the following fields:
  - `className` – string overriding the default `"menu-item add-step"` css classes on the corresponding context menu item
  - `title` – string defining the tool-tip to show for the corresponding context menu item
  - `isActionAllowed` – function for preventing adding step nodes after certain elements, expecting a `boolean` to be returned based on the reference to the selected element
  - `getStepData` – function for providing the default `data` on a newly added step node based on the reference to the element where the corresponding context menu item was clicked
- `addFollowingDivergingGateway` – object for customizing the adding of diverging gateway nodes, expecting any of the following fields:
  - `className` – string overriding the default `"menu-item add-gateway"` css classes on the corresponding context menu item
  - `title` – string defining the tool-tip to show for the corresponding context menu item
  - `isActionAllowed` – function for preventing adding diverging gateways after certain elements, expecting a `boolean` to be returned based on the reference to the element where the corresponding context menu item was clicked
  - `getGatewayData` – function for providing the default `data` on a newly added diverging gateway based on the reference to the selected element
  - `getBranchConditionData`– function for providing an array of the default `conditionData` objects for each branch of a newly added diverging gateway based on the reference to the element where the corresponding context menu item was clicked; thereby also determining how many branches there are by default
- `changeNextElement` – object for customizing the links between elements in the flow, expecting any of the following fields:
  - `className` – string overriding the default `"menu-item change-next"` css classes on the corresponding context menu item
  - `title` – string defining the tool-tip to show for the corresponding context menu item
  - `isActionAllowed` – function for preventing links from certain elements to be changed, expecting a `boolean` to be returned based on the reference to the selected element
- `removeElement` – object for customizing the removal of elements in the flow, expecting any of the following fields:
  - `className` – string overriding the default `"menu-item remove"` css classes on the corresponding context menu item
  - `title` – string defining the tool-tip to show for the corresponding context menu item
  - `isActionAllowed` – function for preventing certain elements to be removed, expecting a `boolean` to be returned based on the reference to the selected element

### Example (read-only)
```javascript
import { FlowModeler } from "react-flow-modeler";
```
```javascript
<FlowModeler
    flow={{
        firstElementId: "a",
        elements: {
            "a": {
                nextElementId: "b",
                data: { stepContent: "A" }
            },
            "b": {
                nextElements: [
                    { id: "c", conditionData: { conditionValue: "1" } },
                    { conditionData: { conditionValue: "2" } }
                ],
                data: { conditionType: "B?" }
            },
            "c": {
                data: { stepContent: "C" }
            }
        }
    }}
    renderStep={({ data }) => <label>{data ? data.stepContent : null}</label>}
    renderGatewayConditionType={({ data }) => <label>{data ? data.conditionType : null}</label>}
    renderGatewayConditionValue={({ data }) => <label>{data ? data.conditionValue : null}</label>}
/>
```

### Example (structural editing, starting with empty "flow")
```javascript
import { FlowModeler } from "react-flow-modeler";

const externalState = {
    flow: { firstElementId: null, elements: {} }
};
```
```javascript
<FlowModeler
    flow={externalState.flow}
    renderStep={({ data }) => data ? <label>{data.value}</label> : null}
    renderGatewayConditionType={({ data }) => data ? <label>{data.value}</label> : null}
    renderGatewayConditionValue={({ data }) => data ? <label>{data.value}</label> : null}
    onChange={({ changedFlow }) => { externalState.flow = changedFlow; }}
/>
```


[npm-image]: https://badge.fury.io/js/react-flow-modeler.svg
[npm-url]: https://www.npmjs.com/package/react-flow-modeler
[github-action-image]: https://github.com/CarstenWickner/react-flow-modeler/workflows/Node%20CI/badge.svg
[storybook-image]: https://raw.githubusercontent.com/storybooks/storybook/next/docs/src/design/homepage/storybook-logo.svg?sanitize=true
[storybook-url]: https://CarstenWickner.github.io/react-flow-modeler/?path=/docs/flowmodeler--show-case

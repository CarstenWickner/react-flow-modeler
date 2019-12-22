# React Flow Modeler

[![npm version][npm-image]][npm-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]

[![Build Status][travis-ci-image]][travis-ci-url]
[![Coverage Status][coverage-image]][coverage-url]

Introducing a component for viewing/editing simple flow-charts but with the ability to easily customise the contents of the "task" elements.

The layout is handled through CSS `grid` which avoids error-prone pixel calculations.
The limited flexibility is accepted and even desired to concentrate on the more important content while still achieving a uniform design.

## Demo

Have a look at the [![Storybook][storybook-image]][storybook-url]

## Usage

### Installation from NPM

In active development, i.e. not yet published

### React Component Props of `<FlowModeler>`

| Prop | Description |
| --- | --- |
| `flow` (required) | model description of the flow-chart to be displayed |
| `renderContent` (required) | custom render function for the "content" elements |
| `renderGatewayConditionType` | custom render function for the condition label following an exclusive gateway |
| `renderGatewayConditionValue` | custom render function for the condition label in front of an element following an exclusive gateway |


[npm-image]: https://badge.fury.io/js/react-flow-modeler.svg
[npm-url]: https://www.npmjs.com/package/react-flow-modeler
[greenkeeper-image]: https://badges.greenkeeper.io/CarstenWickner/react-flow-modeler.svg
[greenkeeper-url]: https://greenkeeper.io/
[travis-ci-image]: https://travis-ci.org/CarstenWickner/react-flow-modeler.svg
[travis-ci-url]: https://travis-ci.org/CarstenWickner/react-flow-modeler
[coverage-image]: https://coveralls.io/repos/github/CarstenWickner/react-flow-modeler/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/CarstenWickner/react-flow-modeler?branch=master
[storybook-image]: https://raw.githubusercontent.com/storybooks/storybook/next/docs/src/design/homepage/storybook-logo.svg?sanitize=true
[storybook-url]: https://CarstenWickner.github.io/react-flow-modeler/?path=/docs/flowmodeler--show-case

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Converging gateway is now displayed as "Inclusive" instead of "Exclusive" to differentiate from diverging gateways

### Fixed
- Negative `z-index` on horizontal lines cause them to be hidden in some browsers

## [1.1.0] - 2020-02-29
### Added
- Export of `updateStepData()` function for manipulating content of a single step node
- Export of `updateGatewayData()` function for manipulating condition type associated with a single diverging gateway node
- Export of `updateGatewayBranchData()` function for manipulating condition value associated with a single diverging gateway branch
- Export of `validateFlow()` function (as alternative to `isFlowValid()`) throwing a descriptive error in case of an invalid flow

## [1.0.1] - 2020-02-23
### Added
- Mentioning of all component props in README
- Basic examples in README

### Fixed
- Invalid key assignment results in incorrect partial rendering during structural editing

## [1.0.0] - 2020-02-22
### Added
- Allow for simple process flows to be displayed
- Automatic positioning of elements in a grid (i.e. no "pixel pushing")
- Enable customization of the content of a `StepNode`
- Enable customization of the condition type associated with a `DivergingGatewayNode`
- Enable customization of the condition value associated with a `DivergingGatewayBranch`
- Automatically insert a `ConvergingGatewayNode` where multiple elements reference the same next element
- Enforce the existence of exactly one `StartNode` and one `EndNode`
- Allow structural editing
- Enable customization of edit icons and tool-tips
- Enable customization of when certain edit actions are not allowed
- Enable customization of default content of a newly added `StepNode`
- Enable customization of default condition type, number of branches and associated condition values for a newly added `DivergingGatewayNode`
- Expose internal validation logic

[1.1.0]: https://github.com/CarstenWickner/react-jsonschema-inspector/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/CarstenWickner/react-jsonschema-inspector/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/CarstenWickner/react-jsonschema-inspector/releases/tag/v1.0.0

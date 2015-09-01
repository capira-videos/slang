# slang
`slang` is a family of world's most awesome javascript libraries to evaluate user input from quizzes.
Essentially it is a collection of Functions with type `String x String -> bool` that compare if to Strings mean the same. 

The purpose of this project is the abstraction of ui and logic. 
The Project _Capira Socrates_ is the UI and _slang_ are more or less intelligent algorithms to compare user input to on a semantic level. 

The family consists of:
- `mathslang` world's most awesome js-lib to match mathematical expressions. by tino 
- `logicslang` world's most awesome js-lib to match for logical expressions. by tino and stef
- `langslang`  world's most awesome js-lib to match for logical expressions. by stef
- `hausdorffslang` world's most awesome js implementation of the hausdorff-metrik 
- `colorslang` world's most awesome js implementation to match colors 

## usage 
- option A: download dist/slang.min.js
- option B: install via bower `bower install --save git@github.com:capira12/slang.git#master`
Make sure you have your private key correctly set. See https://help.github.com/articles/error-permission-denied-publickey/


## development

### install tools 
- Install [node.js](https://nodejs.org/download/)
- Install tools via command line
	- in your terminal navigate to `/slang`
	- `npm install`
	- `bower install`

### use tools 
- build mathslang.min.js: `gulp`

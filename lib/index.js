"use babel"

const PropTypes = require('prop-types')
const React = require('react')
const  markmapAPI  = require('markmap-lib/dist/view.js')
import { transform } from 'markmap-lib/dist/transform.js'
const { markdownRenderer } = require('inkdrop')

class SVGWrap extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = null
	//	this.myRef = React.createRef();
	}
	render() {
		return <svg ref={el =>(this.myRef = el)} />;
	}
}
class Markmap extends React.Component {
	static propTypes = {
		children: PropTypes.arrayOf(PropTypes.string)
	}

	constructor(props) {
		super(props)
		this.markmapId = 'markmap-' +
			Math.random().toString(36).replace(/[^a-z]+/g,'')
			.substr(0, 5)
		this.state = { svg: '', error: null }
		console.log("Markmap-id is ",this.markmapId)
	}

	componentDidMount() {
		this.renderDiagram(this.props.children[0])
	}

	componentDidUpdate(prevProps) {
		if (prevProps.children[0] !== this.props.children[0]) {
			this.renderDiagram(this.props.children[0])
		}
	}

	componentWilllUnmount() {
		this.cleanupMarkmapDiv()
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			nextProps.children[0] !== this.props.children[0] ||
			nextState.svg !== this.state.svg ||
			nextState.error !== this.state.error
		)
	}

	render() {
		const { error } = this.state
		if (error) console.log('MARKMAP: render error', error)

		return (<div id='outer'>
			<div className="markmap-diagram" id={this.markmapId} ref={el => (this.container = el)} dangerouslySetInnerHTML={{ __html: this.state.svg }} />
			<div id='inner2' ref={el => (this.markmapTarget = el)}>
				<svg id="markmap" style={{width: "800px", height: "800px"}}></svg>
			</div>
			  {error && (
				  <div className="ui error message">
				    <div className="header">Failed to render Markmap</div>
				    <div><pre>{error.message}</pre></div>
				   </div>
			  )}
			</div>
		)
			 // <div dangerouslySetInnerHTML={{ __html: this.state.svg }} />
	}

	renderDiagram(code) {
		try {
			this.cleanupMarkmapDiv()
			const { root, features } = transform(code);
			//this.svg_cont = React.createRef()
			//const element = React.createElement("svg", {className:"markmap-diagram", ref: this.svg_cont})
			//const svg = <SVGWrap />
				//<svg id={this.markmapId} />
			//console.log("SVG IS", svg)
			//console.log("warp IS", svg.myRef)
			//console.log("element", element)
			console.log("this", this)
			console.log("Markmap-id is ",this.markmapId)
			console.log("container", this.container)
			const svg = this.markmapTarget.querySelector('svg')

			if (this.container) {
				//markmapAPI.Markmap.create(svg, null, root)
				const mm = new markmapAPI.Markmap(svg, null)
				mm.setData(root)
			}
//			const svg = this.container.replace(/^<div/, "<svg")
//			console.log("SVG IS", svg)
			console.log("data", this.markmapTarget.querySelector('svg').parentElement.innerHTML)
			this.setState({ error: null, svg: this.container.querySelector('svg').parentElement.innerHTML})
		} catch (e) {
			this.setState({ error: e, svg: ''})
		}
	}

	cleanupMarkmapDiv() {
		const el = document.querySelector(`#${this.markmapId}`)
		if (el) el.remove()
		else console.log("Could not find markmap div")
		const el2 = document.querySelector(`#d${this.markmapId}`)
		if (el2) el2.remove()
		else console.log("Could not find markmap div2")
	}
}

module.exports = {
	config: {
	},

	activate() {
		const a = require('markmap-lib/dist/view.js')
		console.log("init", a.Markmap)
		if (markdownRenderer) {
			markdownRenderer.remarkCodeComponents.markmap = Markmap
		}
	},

	deactivate() {
		if (markdownRenderer) {
			markdownRenderer.remarkCodeComponents.markmap = null
		}
	}
}

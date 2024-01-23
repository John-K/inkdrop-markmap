"use babel"

const PropTypes = require('prop-types')
const React = require('react')
const  markmapAPI  = require('markmap-lib/dist/view.js')
import { transform } from 'markmap-lib/dist/transform.js'
const { markdownRenderer } = require('inkdrop')
import CodeMirror from 'codemirror'

// Syntax highlighting options
const CODEMIRROR_OPTS = {
	name: 'markmap',
	mime: 'text/x-gfm',
	mode: 'gfm',
	ext: [],
	alias: []
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
		this.svgId = this.markmapId+"-svg"
		this.state = { svg: '', error: null }
	}

	componentDidMount() {
		this.renderDiagram(this.props.children[0])
	}

	componentDidUpdate(prevProps) {
		if (prevProps.children[0] !== this.props.children[0]) {
			this.renderDiagram(this.props.children[0])
		}
	}

	componentWillUnmount() {
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
		return (
			<div className="markmap-diagram" id={this.markmapId} style={{width: "100%", height: "100%"}} ref={el => (this.container = el)}>
			<div id='inner2' style={{width: "100%", height: "100%"}} ref={el => (this.markmapTarget = el)}>
				<svg id={this.svgId} style={{width: "100%", height: "100%"}}></svg>
			</div>
			  {error && (
				  <div className="ui error message">
				    <div className="header">Failed to render Markmap</div>
				    <div><pre>{error.message}</pre></div>
				   </div>
			  )}
			</div>
		)
	}

	renderDiagram(code) {
		try {
			const { root, features } = transform(code);
			const svg = this.markmapTarget.querySelector('svg')
			svg.innerHTML = ''
			if (this.container) {
				const mm = new markmapAPI.Markmap(svg, null)
				mm.setData(root)
				svg.to
				//console.log(mm)
				console.log("maxY", mm.state.maxY,"maxX", mm.state.maxX)
				const ratio = mm.state.maxY / mm.state.maxX

				// get our element and our parents
				const diagram_el = document.querySelector(`#${this.markmapId}`)
				const parent_el = diagram_el.parentElement

				// make the parent "<pre>" play nice
				parent_el.style.padding = "0px"
				parent_el.style.overflow = "hidden"

				// it appears that only clientWidth gives us the actual display width
				// console.log("parent width", parent_el.width)
				// console.log("parent width client", parent_el.clientWidth)
				// console.log("container width", this.container.width)

				// resize containing div to contain the diagram's natural height
				const height = Math.ceil(parent_el.clientWidth / ratio * 2)
				parent_el.style.height = height+"px"

				// zoom to fit
				mm.fit()
			}

			this.setState({ error: null, svg: svg.outerHTML})
		} catch (e) {
			this.setState({ error: e, svg: ''})
		}
	}

	cleanupMarkmapDiv() {
		const el = document.querySelector(`#${this.markmapId}`)
		if (el) {
			el.remove()
		} else {
			console.log("Could not find markmap div for cleanup")
		}
	}

}

module.exports = {
	activate() {
		if (markdownRenderer) {
			markdownRenderer.remarkCodeComponents.markmap = Markmap
		}

		// Enable syntax highlighting (Thanks Takuya!)
		if (CodeMirror) {
			CodeMirror.modeInfo.push(CODEMIRROR_OPTS)
		}
		this.subscription = inkdrop.commands.add(document.body, {
			'markmap:render-doc': () => require("./render-doc").renderDoc()
		});
	},

	deactivate() {
		if (markdownRenderer) {
			markdownRenderer.remarkCodeComponents.markmap = null
		}
		this.subscription.dispose();
	}
}

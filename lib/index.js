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
		console.log("update")
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
			<div className="markmap-diagram" id={this.markmapId} ref={el => (this.container = el)}>
			<div id='inner2' style={{width: "80%"}} ref={el => (this.markmapTarget = el)}>
				<svg id="markmap" style={{width: "100%", height: "100%"}}></svg>
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

				//resize containing div to contain the diagram's natural height
				const height = mm.state.maxY - mm.state.minY
				//console.log("setting", this.markmapId, "height to", height+"px")
				this.markmapTarget.style.height = height+"px"

				// zoom to fit (which should do nothing here?)
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
	},

	deactivate() {
		if (markdownRenderer) {
			markdownRenderer.remarkCodeComponents.markmap = null
		}
	}
}

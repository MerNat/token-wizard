import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Web3 from 'web3'
import { Loader } from '../components/Common/Loader'

class Web3Provider extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      selectedAccount: null,
      web3: null,
      approvePermissions: null,
      render: false
    }

  }

  render() {
    const { web3UnavailableScreen: Web3UnavailableScreen } = this.props
    let renderContainer = false

    if (this.state.render) {
      if (this.state.web3 && this.state.approvePermissions) {
        renderContainer = this.props.children
      } else {
        renderContainer =  <Web3UnavailableScreen/>
      }
    } else {
      renderContainer = <Loader show={true}></Loader>
    }
    return ( renderContainer )

  }

  componentDidMount() {
    this.checkWeb3()

    // Wait 1 second to render
    setTimeout(function() {
      this.setState({render: true})
    }.bind(this), 1500)
  }

  checkWeb3() {
    const setWeb3 = () => {
      try {
        window.web3 = new Web3(window.web3.currentProvider)
        this.setState({
          approvePermissions: true,
          web3: window.web3
        })
        this.fetchAccounts()
      } catch (err) {
        console.log('There was a problem fetching accounts', err)
      }
    }

    const { ethereum } = window
      // Modern dapp browsers...
    if (ethereum) {
      window.web3 = new Web3(ethereum)
      try {
          // Request account access if needed
        ethereum.enable().then(()=> {
          if (!this.state.web3) {
            setWeb3()
          }
        })
      } catch (error) {
          // User denied account access...
        console.log('User denied account access')
      }
    }
      // Legacy dapp browsers...
    else if (window.web3) {
      setWeb3()
    }
      // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying a wallet!')
    }
  }

  fetchAccounts = () => {
    const { web3  } = this.state
    const { onChangeAccount } = this.props

    if (!web3 || !web3.eth) {
      return
    }

    return web3.eth.getAccounts()
      .then(accounts => {
        if (!accounts || !accounts.length) {
          return
        }

        let curr = this.state.selectedAccount
        let next = accounts[0]
        curr = curr && curr.toLowerCase()
        next = next && next.toLowerCase()

        const didChange = curr && next && (curr !== next)

        if (didChange && typeof onChangeAccount === 'function') {
          onChangeAccount(next)
        }

        this.setState({
          selectedAccount: next || null
        })
      })
  }

  getChildContext() {
    return {
      web3: this.state.web3,
      selectedAccount: this.state.selectedAccount
    }
  }
}

Web3Provider.childContextTypes = {
  web3: PropTypes.object,
  selectedAccount: PropTypes.string
}

export default Web3Provider;

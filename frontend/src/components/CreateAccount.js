import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CreateAccount_Page_Background from '../images/login_bg';
import { Link } from 'react-router-dom';

var main_div_style={
    width:'500px',
    height:'450px',
    position:'absolute',
    left:'180px',
    top:'175px',
    backgroundColor:'#292929',
    borderRadius:'0.7rem'
}

var NameStyle ={
    position:'relative',
    left:'49px',
    width:'400px',
    backgroundColor:'#48494B'
}

var UserNameStyle={
    position:'relative',
    left:'49px',
    width:'400px',
    top:'20px',
    backgroundColor:'#48494B'
}
var EmailStyle={
    position:'relative',
    left:'49px',
    width:'400px',
    top:'20px',
    backgroundColor:'#48494B'
}

var PasswordStyle={
    position:'relative',
    left:'49px',
    width:'400px',
    top:'30px',
    backgroundColor: '#48494B'
}

var ButtonStyle={
    position:'relative',
    height:'35px',
    width:'200px',
    left:'145px',
    top:'70px',
    backgroundColor:'#63C5DA'
}

var outer_div_style = {
    backgroundImage : `url(${CreateAccount_Page_Background})`,
    backgroundPosition : 'center',
    backgroundSize : 'cover',
    backgroundRepeat : 'no-repeat',
    width : '1600px',
    height: '769px',
    margin : '-8px'
}

var LinkStyle={
    position:'relative',
    left:'120px',
    top:'75px',
    textDecoration:'none'
}

var UserNameStyle = {
    position:'relative',
    left:'49px',
    width:'400px',
    backgroundColor: '#48494B',
    top:'10px'
}

class CreateAccount extends React.Component{
    constructor(props)
    {
        super(props)
        this.CreateAccountHandler=this.CreateAccountHandler.bind(this)
        this.nameHandler=this.nameHandler.bind(this)
        this.emailHandler=this.emailHandler.bind(this)
        this.passwordHandler = this.passwordHandler.bind(this)
        this.usernameHandler = this.usernameHandler.bind(this)
        this.state={
            name: '',
            username:'',
            email:'',
            password:''
        }
    }

    nameHandler(event)
    {
        var name = event.target.value
        this.setState({
            name:name
        })
    }

    usernameHandler(event)
    {
        var username = event.target.value
        this.setState({
            username:username
        })
    }

    emailHandler(event)
    {
        var email = event.target.value
        this.setState({
            email:email
        })
    }

    passwordHandler(event)
    {
        var password = event.target.value
        this.setState({
            password:password
        })
    }

    CreateAccountHandler()
    {
        fetch('http://localhost:5000/accounts',{
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              name: this.state.name,
              username:this.state.username,
              email:this.state.email,
              password:this.state.password
          }),
          method:'POST'
        })
        .then(res => res.json())
        .then((data) => {
            localStorage.setItem('token',data.token)
            this.props.history.push('/Home')
        })
        .catch((e) => {
            console.log('e')
        })
    }
    render()
    {
        return (
            <div style = {outer_div_style}>
                <div style={main_div_style}>
                <h1 style={{color:'white',position:'relative',left:'115px'}}>Create an account</h1>
                <form method='post' action='http://localhost:5000/accounts'>
                    <TextField id="outlined-dense" label="Name" margin="dense" variant="outlined" onChange={this.nameHandler} style={NameStyle} color="secondary" name='name' />
                    <TextField id="outlined-dense" label="Username" margin="dense" variant="outlined" onChange={this.usernameHandler} style={UserNameStyle} color="secondary" name='username'/>
                    <TextField id="outlined-dense" label="Email" margin="dense" variant="outlined" onChange={this.emailHandler} style={EmailStyle} color="secondary" name='email'/>
                    <TextField id="outlined-dense" label="Password" type = "password" margin="dense" variant="outlined" onChange={this.passwordHandler} style={PasswordStyle} color="secondary" name='password'/>
                    <Button style={ButtonStyle} variant="contained" color="black" onClick={this.CreateAccountHandler}>SUBMIT</Button>
                    <Link to='/' style={LinkStyle}><h4 style={{color:'white'}}>Already have an account ? Sign in here</h4></Link>
                </form>
                </div>
            </div>
        )
    }
}
export default CreateAccount
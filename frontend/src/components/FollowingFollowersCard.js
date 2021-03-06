import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ClearIcon from '@material-ui/icons/Clear';
import {Link} from 'react-router-dom';

var FollowingFollowersCardStyle={
    position:'absolute',
    left:'1050px',
    bottom:'23px',
    backgroundImage: 'linear-gradient(to top, #00c6fb 0%, #005bea 100%)',
    width:'600px',
    background: '#BBD2C5',
    background: '-webkit-linear-gradient(to right, #536976, #BBD2C5)',
    background: 'linear-gradient(to right, #536976, #BBD2C5)'
}

var ProfilePictureInFollowingFollowersCard={
    height:'50px',
    position:'relative',
    width:'50px',
    left:'20px',
    top:'20px',
    borderRadius:'3rem'
}

class FollowingFollowersCard extends React.Component{

    constructor(props)
    {
        super(props)
    }

    render()
    {
        return(
            <Card style={ this.props.type=="" ? {display:'none'} : FollowingFollowersCardStyle}>
                <CardContent>
                <h1 style={{color:'white',position:'relative',left:'20px'}}>{this.props.type}</h1>
                <ClearIcon style={{position:'relative',bottom:'52px',left:'510px',cursor:'pointer'}} onClick={this.props.ClearFollowingFollowersCardHandler}/>
                <div>
                    {this.props.following_or_follower_data.map((accountObject) => 
                        <div key={accountObject.account_username}>
                            <img style={ProfilePictureInFollowingFollowersCard} src={accountObject.account_img_src}/>
                            <Link to={"/profile/"+accountObject.account_id} style={{ textDecoration: 'none'}}>
                                <h1 style={{display:'inline',position:'relative',left:'60px',color:'#FDF5E6',fontWeight:'bold'}}>{accountObject.account_name}</h1>
                            </Link>
                            <h1 style={{display:'inline',position:'relative',left:'280px',color:'#FDF5E6',fontFamily:'Times New Roman,serif'}}>{"@"+accountObject.account_username}</h1>
                        </div>
                    )} 
                </div>
                </CardContent>
            </Card>
        )
    }
}

export default FollowingFollowersCard
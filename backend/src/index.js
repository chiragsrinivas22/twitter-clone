const express = require('express')
require('./database/mongoose.js')
const Account = require('./database/models/account.js')
const Tweet = require('./database/models/tweet.js')
const authMiddleware = require('./authentication/auth.js')
const bodyParser = require('body-parser')
const ObjectID = require('mongodb').ObjectID
const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/selfID', authMiddleware, async (req, res) => {
    const account = await Account.findById(req.account._id)
    res.send({
        selfID : account._id
    })
})

app.post('/accounts', async (req, res) => {
    const account = new Account(req.body)
    const token = await account.generateToken()

    account.tokens.push({
        token: token
    })

    try {
        await account.save()
        res.status(201)
        res.send({
            account: account,
            token: token
        })
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'Could not create new user'
        })
    }
})

app.post('/accounts/login', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Authorization')
    try {
        const account = await Account.findAccountByEmailAndPassword(req.body.email, req.body.password)
        const token = await account.generateToken()
        account.tokens.push({
            token: token
        })
        await account.save()
        res.status(200)
        res.send({
            Message: 'Logged in successfully',
            token: token
        })
    }
    catch (e) {
        res.status(404)
        res.send({
            ErrorMessage: e.message
        })
    }
})

app.post('/accounts/logout', authMiddleware, async (req, res) => {
    const account = req.account
    const token = req.token

    for (var i = 0; i < account.tokens.length; i++)
    {
        if (account.tokens[i].token == token)
        {
            account.tokens.splice(i,1)
        }    
    }

    await account.save()
    res.send({
        Message: 'Logged out successfully'
    })
})

app.post('/accounts/logoutEverywhere', authMiddleware, async (req, res) => {
    const account = req.account
    const token = req.token
    account.tokens = []

    await account.save()
    res.send({
        Message: 'Logged out from all sessions successfully'
    })
})

app.get('/accounts/me', authMiddleware, async (req, res) => {
    const account = req.account
    res.send(account)
})


app.delete('/accounts/myAccount', authMiddleware, async (req, res) => {
    try {
        await req.account.remove()
        res.send({
            Message: 'Account deleted'
        })
    }
    catch (error) {
        res.status(500)
        res.send({
            Message: 'Account does not exist'
        })
    }
})

app.patch('/accounts/addFollower/:id', authMiddleware, async (req, res) => {
    const account = req.account
    const follower_id = req.params.id


    try {
        if (follower_id == account._id) {
            throw new Error()
        }
        const followerAccount = await Account.findById(follower_id)

        account.followers.forEach((follower) => {
            if (follower.user_id == follower_id) {
                throw new Error()
            }
        })

        account.followers.push({
            user_id: followerAccount._id
        })
        await account.save()
        res.send(account)
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.patch('/accounts/addFollowing/:id', authMiddleware, async (req, res) => {
    const account = req.account
    const following_id = req.params.id


    try {
        if (following_id == account._id) {
            throw new Error()
        }
        const followingAccount = await Account.findById(following_id)

        account.following.forEach((following) => {
            if (following.user_id == following_id) {
                throw new Error()
            }
        })

        account.following.push({
            user_id: followingAccount._id
        })
        followingAccount.followers.push({
            user_id: account._id
        })
        await account.save()
        await followingAccount.save()
        res.send(account)
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.patch('/accounts/removeFollower/:id', authMiddleware, async (req, res) => {
    const account = req.account
    const follower_id = new ObjectID(req.params.id)

    try {
        if (JSON.stringify(follower_id) == JSON.stringify(account._id)) {
            throw new Error()
        }
        await Account.findOne({ _id: follower_id })
        var flag = 0
        for (var i = 0; i < account.followers.length; i++) {
            if (JSON.stringify(account.followers[i].user_id) == JSON.stringify(follower_id)) {
                flag = 1
            }
        }
        if (flag == 0) {
            throw new Error()
        }
        account.followers = account.followers.filter((accountObject) => {
            accountObject.user_id != follower_id
        })
        await account.save()
        res.send(account)
    }
    catch (e) {
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.patch('/accounts/removeFollowing/:id', authMiddleware, async (req, res) => {
    const account = req.account
    const following_id = new ObjectID(req.params.id)

    try {
        if (JSON.stringify(following_id) == JSON.stringify(account._id)) {
            throw new Error()
        }
        const followingAccount = await Account.findOne({ _id: following_id })
        var flag = 0
        for (var i = 0; i < account.following.length; i++) {
            if (JSON.stringify(account.following[i].user_id) == JSON.stringify(following_id)) {
                flag = 1
            }
        }
        if (flag == 0) {
            throw new Error()
        }
        account.following = account.following.filter((accountObject) => {
            accountObject.user_id != following_id
        })
        followingAccount.followers = followingAccount.followers.filter((accountObject) => {
            accountObject.user_id != account._id
        })
        await account.save()
        await followingAccount.save()
        res.send(account)
    }
    catch (e) {
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.post('/tweets', authMiddleware, async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        account: req.account._id
    })
    try {
        await tweet.save()
        res.status(201)
        res.send(tweet)
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.delete('/tweets/:id', authMiddleware, async (req, res) => {
    const tweet_id = req.params.id
    try {
        const tweet = await Tweet.findById(tweet_id)
        if (JSON.stringify(tweet.account) != JSON.stringify(req.account._id)) {
            throw new Error()
        }
        await tweet.remove()
        res.send({
            Message: 'Tweet deleted successfully'
        })
    }
    catch (e) {
        res.status(500)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.get('/selftweets', authMiddleware, async (req, res) => {
    try {
        await req.account.populate('tweets').execPopulate()
        const data = []
        for (var i = 0; i < req.account.tweets.length; i++) {
            data.push({
                tweet_id: req.account.tweets[i]._id,
                tweet: req.account.tweets[i].tweet,
                account_name: req.account.name,
                no_of_likes : req.account.tweets[i].no_of_likes
            })
        }

        res.send(data)
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.get('/tweets', authMiddleware, async (req, res) => {
    try {
        var tweets_data = await Tweet.find({})
        var self_and_following_ids = []
        self_and_following_ids.push(req.account._id.toString())
        for (var i = 0; i < req.account.following.length; i++)
        {
            self_and_following_ids.push(req.account.following[i].user_id.toString())   
        }
        var data = []
        for (var i = 0; i < tweets_data.length; i++)
        {
            if (self_and_following_ids.includes(tweets_data[i].account.toString()))
            {
                account_of_tweet = await Account.findById(tweets_data[i].account) 
                data.push({
                    tweet_id: tweets_data[i]._id,
                    tweet: tweets_data[i].tweet,
                    account_id : account_of_tweet._id,
                    account_name: account_of_tweet.name,
                    no_of_likes: tweets_data[i].no_of_likes,
                    liked_by : tweets_data[i].liked_by
                })
            }    
        }
        res.send(data)
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.get('/accounts', authMiddleware, async (req, res) => {
    try {
        const accounts = await Account.find({})
        const account_names_with_ids = []
        for (var i = 0; i < accounts.length; i++) {
            if (JSON.stringify(accounts[i]._id) != JSON.stringify(req.account._id))
                account_names_with_ids.push({
                    account_name: accounts[i].name,
                    username:accounts[i].username,
                    account_id: accounts[i]._id
                })
        }
        res.send(account_names_with_ids)
    }
    catch (e) {
        res.send([])
    }
})

app.get('/accounts/getFollowing', authMiddleware, async (req, res) => {
    try {
        const account = req.account
        res.send(account.following)
    }
    catch (e) {
        res.status(400)
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.patch('/LikeTweet/:id', authMiddleware, async (req, res) => {
    var tweet_id = req.params.id
    var account_id = req.account._id

    try {
        var tweet_obj = await Tweet.findById(tweet_id)

        tweet_obj.liked_by.push({
            user_id : account_id
        })
        tweet_obj.no_of_likes += 1
        
        await tweet_obj.save()

        res.send(tweet_obj)
    }
    catch (e)
    {
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.patch('/unlikeTweet/:id', authMiddleware, async (req, res) => {
    var tweet_id = req.params.id
    var account_id = req.account._id

    try {
        var tweet_obj = await Tweet.findById(tweet_id)
        
        for (var i = 0; i < tweet_obj.liked_by.length; i++)
        {
            if (tweet_obj.liked_by[i].user_id.toString() == account_id.toString())
            {
                tweet_obj.liked_by.splice(i,1)
            }    
        }
  
        tweet_obj.no_of_likes -= 1
        
        await tweet_obj.save()
        
        res.send(tweet_obj)
    }
    catch (e)
    {
        res.send({
            ErrorMessage: 'error'
        })
    }
})

app.listen(5000, () => {
    console.log('server is running')
})
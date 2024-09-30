const Patient = require('../models/patientSchema')
const Center = require('../models/Center')

// -----------------------------------------------------------------------------------------------------------------------
exports.getLoginPage = (req, res) => {
    if(req.session.email)
    {
        res.redirect('/')
    }
    res.render('login');
};
// -----------------------------------------------------------------------------------------------------------------------

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Redirect to the original page if it exists, otherwise go to home page
        const redirectTo = req.session.redirectTo || '/';
        delete req.session.redirectTo; // Clear the redirectTo after use
        const center = await Center.findOne({ email })
        if (center) {
            req.session.email = email;
            return res.status(200).json({ success: true, message: '/center-dashboard' });
        }
        const user = await Patient.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'user not exists' });
        }

        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //   return res.status(400).json({ message: 'Invalid credentials' });
        // }
        if (password != user.password) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Login error' });
            }
            req.session.userId = user._id;
            req.session.email = user.email;
            req.session.username = user.patientname;
            return res.status(200).json({ success: true, message: redirectTo });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
};
// -----------------------------------------------------------------------------------------------------------------------

exports.getProfilePage = async (req, res) => {
    try {
        const user = res.locals.user;
        res.render('profile', { user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
// -----------------------------------------------------------------------------------------------------------------------

exports.Logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }

        // Clear the cookie related to the session
        res.clearCookie('connect.sid');  // 'connect.sid' is the default cookie name for sessions

        // Prevent caching of logged-in content
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.redirect('/');
    });
};

// -----------------------------------------------------------------------------------------------------------------------

exports.centerLogout = (req,res)=>{
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Failed to log out' });
        }

        // Clear the cookie related to the session
        res.clearCookie('connect.sid');  // 'connect.sid' is the default cookie name for sessions

        // Prevent caching of logged-in content
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.redirect('/center-dashboard');
    });
}
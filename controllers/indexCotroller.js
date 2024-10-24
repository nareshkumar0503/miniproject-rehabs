const Center = require('../models/Center');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');
const Event = require('../models/eventSchema');
const BookedEvent = require('../models/bookedEventSchema');
const Addiction = require('../models/addictionSchema');
const nodemailer = require('nodemailer');

// ******Configure nodemailer ******Configure nodemailer ******Configure nodemailer ******Configure nodemailer***** /
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});
//*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender*****Pateint-Attender***** */
// ------Landing Page------Landing Page------Landing Page------Landing Page------//
exports.getLandingPage = async (req, res) => {
  try {
    const centers = await Center.find();
    const username = req.session.username;
    return res.render('index', { centers, username });
  } catch (err) {
    return res.status(500).send('Server Error');
  }
};
//****************************************************************************** */

//-------Get Description Page******Get Description Page******Get Description Page******/
exports.getDescPage = async (req, res) => {
  const email = req.query.email || 'No email provided';
  try {
    const patientEmail = req.session.email;
    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      // Store the original URL the user wanted to visit
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }
    const username = req.session.username;
    const appointment = await Appointment.findOne({ patientEmail: patient.email });
    var status = 0;
    if (appointment) {
      if(appointment.status !== 'Cancelled')
        status = 1;
    }
    const center = await Center.findOne({ email });
    return res.render('descPage', { center, username, patient, status });
  } catch (err) {
    return res.status(500).send('Server Error');
  }
};
//****************************************************************************** */

//******Book-Appointment******Book Appointment******Book Appointment************Book Appointment******Book Appointment******Book Appointment******Book Appointment******Book Appointment******Book Appointment****** */
exports.postAppointment = async (req, res) => {
  const { patientName, patientAge, patientEmail, patientPhone, patientAddiction, appointmentDate, appointmentSession, centerEmail, centerName, attenderPhone, patientBloodGroup } = req.body;
  try {
    // Ensure date is in 'YYYY-MM-DD' format
    const formattedAppointmentDate = appointmentDate.substring(0, 10);
    // Step 1: Check if an appointment already exists with the same email and appointment date for the same center
    const existingAppointment = await Appointment.findOne({
      patientEmail: patientEmail,
      appointmentDate: formattedAppointmentDate, // Correct field name
    });

    if (existingAppointment) {
      // Step 2: If an appointment already exists, send a response to the client
      return res.status(400).json({ success: false, message: 'Appointment already exists.' });
    }
    // Step 3: If no appointment exists, create a new appointment
    const newAppointment = new Appointment({
      patientName,
      patientAge,
      patientEmail,
      patientPhone,
      patientAddiction,
      appointmentDate: formattedAppointmentDate,
      appointmentSession,
      centerEmail,
      centerName,
      attenderPhone,
      patientBloodGroup,
      status: "Not Confirmed"
    });
    // Step 4: Save the new appointment to the database
    await newAppointment.save();
    // Step 5: Send confirmation email to the patient
    const mailOptions = {
      from: process.env.EMAIL,
      to: patientEmail,
      subject: `Appointment Booking Pending Confirmation with ${centerName}`,
      html: `
      <p>Dear ${patientName},</p>
      <p>Your appointment with <strong>${centerName}</strong> has been successfully <strong>booked</strong>, but it is currently <strong>pending confirmation</strong> from the center.</p>
      
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${formattedAppointmentDate}</li>
        <li><strong>Session:</strong> ${appointmentSession}</li>
        <li><strong>Center Name:</strong> ${centerName}</li>
        <li><strong>Attender Phone:</strong> ${attenderPhone}</li>
        <li><strong>Patient Name:</strong> ${patientName}</li>
        <li><strong>Patient Blood Group:</strong> ${patientBloodGroup}</li>
        <li><strong>Patient Addiction:</strong> ${patientAddiction}</li>
      </ul>
      
      <p>Please note that the center will review your appointment request and send you a confirmation shortly. Kindly wait for the center to confirm the appointment. We recommend checking your email for updates.</p>

      <p>If you have any urgent inquiries or need to make changes, feel free to contact the center directly at <a href="mailto:${centerEmail}" style="color:rgb(0, 115, 255);">${centerEmail}</a>.</p>
      
      <p><strong>Best regards,</strong><br>
      The ${centerName} Team</p>
      `
    };

    // Step 6: Send the email
    await transporter.sendMail(mailOptions);
    // Step 7: Respond with a success message
    return res.status(201).json({ success: true, message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};
//****************************************************************************************************************************************************************************************************************** */

//******view-Appointment******view-Appointment******view-Appointment******view-Appointment*/
exports.getAppointment = async (req, res) => {
  const patientEmail = req.session.email;
  if (!patientEmail) {
    req.session.redirectTo = req.originalUrl;
    return res.redirect('/login');
  }
  const appointments = await Appointment.find({ patientEmail });
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    let hours12 = (hours % 12) || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    return `${hours12}:${minutes} ${period}`;
  };

  appointments.forEach(appointment => {
    if (appointment.time) {
      appointment.formattedTime = formatTime(appointment.time);
    }
  });
  return res.render('viewappointment', { appointments });
};
//****************************************************************************** */

// ********cancel-appointment ********cancel-appointment ********cancel-appointment ******** */
exports.cancelAppointment = async (req, res) => {
  const { centerEmail } = req.body;
  const patientEmail = req.session.email;
  try {
    // Find and delete the appointment based on the provided centerEmail and appointmentDate
    const result = await Appointment.deleteOne({
      patientEmail,
      centerEmail: centerEmail,
    });
    // Check if the deletion was successful
    if (result.deletedCount > 0) {
      return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'No appointment found to delete' });
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ success: false, message: 'Server error, could not delete appointment' });
  }
};

// ******Event ******Event ******Event ******Event ******Event ******Event ******Event ******Event ****** */
exports.getPEventPage = async (req, res) => {
  try {
    const patientEmail = req.session.email;
    const username = req.session.username;

    if (!patientEmail) {
      // Store the original URL the user wanted to visit
      req.session.redirectTo = req.originalUrl;
      return res.redirect('/login');
    }

    // Find all events the patient has booked
    const bookedEvents = await BookedEvent.find({ patientEmail }).populate('eventId');
    const allEvents = await Event.find();

    // Prepare the data for booked events (myEvents)
    const myEvents = bookedEvents.map(bookedEvent => {
      const event = bookedEvent.eventId; // Refer to the event document
      return {
        id: bookedEvent._id,
        name: event.eventName,
        date: event.eventDate,
        time: event.eventTime,
        bookedOn: bookedEvent.timestamp, // The time when the event was booked
        host: event.centerName,
        description: event.eventDesc
      };
    });

    // Filter out events that are already booked
    const bookedEventIds = bookedEvents.map(bookedEvent => bookedEvent.eventId._id.toString());
    const availableEvents = allEvents.filter(event => !bookedEventIds.includes(event._id.toString()));

    // Render the EJS view with myEvents and availableEvents
    return res.render('events', { myEvents, availableEvents, username });

  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// ******************************************************************************************************* */

// ******book-event ******book-event ******book-event ******book-event ******book-event ******book-event * */
exports.postBookEvent = async (req, res) => {
  try {
    const patientEmail = req.session.email;
    const eventId = req.params.eventId;
    const exists = await BookedEvent.findOne({ patientEmail, eventId });
    if (exists) {
      return res.status(409).json({ success: false, message: 'You have already booked' });
    }
    // Create a new booked event document
    const newEvent = new BookedEvent({
      patientEmail,
      eventId
    });
    await newEvent.save();
    return res.status(200).json({ success: true, message: 'Event Booked Successfully' })
  } catch (err) {
    console.error('Error booking event:', err);
    return res.status(500);
  }
}
// ******************************************************************************************************* */

// *******Delete-Book-Event *******Delete-Book-Event *******Delete-Book-Event *******Delete-Book-Event**** */
exports.deleteBookEvent = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const deleted = await BookedEvent.findByIdAndDelete(eventId);
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
  } catch (err) {
    console.error('Error deleting event:', err);
    return res.status(500);
  }
}

// *****Guidance *****Guidance *****Guidance *****Guidance *****Guidance *****Guidance *****Guidance ***** */
exports.getGuidancePage = async (req, res) => {
  // Check if the user is authenticated
  const username = req.session.username;
  if (!req.session.userId) {
    req.session.redirectTo = req.originalUrl;
    return res.render('guidance', { message: 'login', scores: {}, messages: {}, tips: {}, username });
  }

  try {
    // Fetch the addictions for the logged-in user
    const addictions = await Addiction.find({ patient: req.session.userId });
    let scores = {};
    let messages = {};
    let tips = {};
    if (addictions.length === 0) {
      // No addictions found
      return res.render('guidance', { message: 'No addiction data found. Please enter your details.', scores, messages, tips, username });
    }
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    // Loop through each addiction entry
    for (const addiction of addictions) {
      const lastEntry = addiction.entries[addiction.entries.length - 1]; // Get the most recent entry

      if (lastEntry && lastEntry.date.toISOString().split('T')[0] === today) {
        const value = lastEntry.value;
        let score = 0;
        // Calculate score based on value
        if (addiction.addictionType === 'drug') {
          score = (value > 0.13) ? 5 : 3;
        } else if (addiction.addictionType === 'alcohol') {
          // Scoring for men (number of drinks per day)
          if (value <= 2) {
            score = 1; // Safe consumption
          } else if (value >= 3 && value <= 4) {
            score = 3; // At-risk consumption
          } else if (value >= 5) {
            score = 5; // Critical consumption or binge drinking
          }
        } else if (addiction.addictionType === 'smoking') {
          if (value < 2) {
            score = 1;
          } else if (value >= 2 && value < 6) {
            score = 3;
          } else if (value > 5) {
            score = 5;
          }
        } else if (addiction.addictionType === 'internet') {
          if (value < 2) {
            score = 1;
          } else if (value < 6) {
            score = 3;
          } else if (value > 5) {
            score = 5;
          }
        } else if (addiction.addictionType === 'gambling') {
          score = (value > 0.1) ? 5 : 3;
        }

        scores[addiction.addictionType] = score; // Store the score

        // Get tips based on addiction type and score
        const tip = getTips(addiction.addictionType, score);
        tips[addiction.addictionType] = tip;
        // Check for previous day's value
        const previousValue = addiction.entries[addiction.entries.length - 2]?.value || 0; // Get previous value
        const currentValue = lastEntry.value;

        // Generate message based on current and previous values
        messages[addiction.addictionType] = (currentValue > previousValue)
          ? 'You have increased your consumption. Please be mindful.'
          : 'Keep it up! Your consumption is stable or decreasing.';
      }
    }
    return res.render('guidance', { scores, messages, tips, message: '', username });
  } catch {
    console.error('Error fetching addiction data:', error);
    return res.render('guidance', { message: 'An error occurred while fetching your data.', scores: {}, messages: {}, tips: {}, username });
  }
}

// ******Tips ******Tips ******Tips ******Tips ******Tips ******Tips ****** */
function getTips(addictionType, score) {
  if (score === 3) {
    if (addictionType === 'drug') {
      return `<h3>Actions:</h3>
<ul>
  <li><strong>Set Limits and Monitor Use:</strong> If you have experimented with drugs, keep a record of usage and set limits. Seek out alternative ways to relax or unwind.</li>
  <li><strong>Avoid High-Risk Environments:</strong> Steer clear of environments where drug use is common, like parties or gatherings that may expose you to temptations.</li>
</ul>

<h3>Food Habits:</h3>
<ul>
  <li><strong>Clean Diet:</strong> Focus on whole foods that are rich in fiber, vitamins, and minerals. Avoid processed foods, which can increase cravings.</li>
</ul>

<h3>Exercise:</h3>
<ul>
  <li><strong>Regular Workouts:</strong> Engage in activities like weight training or swimming, which can give you a natural high through the release of endorphins.</li>
  <li><strong>Stress-Reducing Exercise:</strong> Yoga or tai chi can help manage stress, which might otherwise trigger drug use.</li>
</ul>`;
    } else if (addictionType === 'alcohol') {
      return `<h3>Actions:</h3>
<ul>
  <li><strong>Limit Alcohol to Weekends:</strong> If you're drinking more often than recommended, limit alcohol consumption to weekends and control the quantity.</li>
  <li><strong>Find Non-Alcoholic Alternatives:</strong> Replace alcohol with non-alcoholic beverages, like sparkling water with lime, to simulate the same social enjoyment without the alcohol.</li>
  <li><strong>Seek Social Support:</strong> Talk to a close friend or family member who can help keep you accountable and aware of your consumption patterns.</li>
</ul>

<h3>Food Habits:</h3>
<ul>
  <li><strong>Cut Down on Sugary Foods:</strong> Alcohol is high in sugar, which can lead to overconsumption. Switch to foods with natural sugars, such as fruits.</li>
  <li><strong>Eat Balanced Meals Before Drinking:</strong> Never drink on an empty stomach. Eat a balanced meal containing protein, complex carbs, and healthy fats (e.g., grilled chicken, brown rice, avocado) to slow alcohol absorption.</li>
</ul>

<h3>Exercise:</h3>
<ul>
  <li><strong>Increase Cardio:</strong> Alcohol has a direct impact on cardiovascular health. Engaging in regular cardio (e.g., cycling or running) will help mitigate some of the harmful effects.</li>
  <li><strong>Join Fitness Classes:</strong> Structured classes like Pilates or Zumba can keep you motivated and physically occupied during typical drinking hours.</li>
</ul>
`;
    } else if (addictionType === 'smoking') {
      return ` <h3>Actions:</h3>
    <ul>
        <li><strong>Set a Smoking Limit:</strong> If you’re smoking occasionally, set strict boundaries around when and where you smoke. Gradually reduce the frequency.
            <br><em>Example:</em> Reduce daily cigarettes from 5 to 3 in the first week, then to 1 in the second week.
        </li>
        <li><strong>Identify Smoking Triggers:</strong> Keep a journal to track the emotions or situations that prompt smoking.
            <br><em>Example:</em> If stress or boredom is a trigger, practice mindfulness or engage in an activity to divert your attention.
        </li>
        <li><strong>Use Substitutes:</strong> When cravings hit, try sugar-free gum or a stress ball as a temporary substitute.
        </li>
    </ul>

    <h3>Food Habits:</h3>
    <ul>
        <li><strong>Vitamin C:</strong> Smoking depletes your body’s Vitamin C levels. Eat fruits like oranges, kiwi, and bell peppers to replenish and detox.
        </li>
        <li><strong>Avoid Caffeine:</strong> Nicotine amplifies the effects of caffeine, potentially worsening anxiety. Switch to herbal teas or water to help with relaxation.
        </li>
    </ul>

    <h3>Exercise:</h3>
    <ul>
        <li><strong>Lung Strengthening Exercises:</strong> Engage in deep breathing techniques and exercises like swimming to improve lung function.
        </li>
        <li><strong>Start a Walking Routine:</strong> Replace your smoking break with a short walk around the block, easing the habit transition.
        </li>
    </ul>`;
    } else if (addictionType === 'internet') {
      return `<h3>Actions:</h3>
    <ul>
        <li><strong>Use Apps to Block Distracting Apps:</strong> Install app blockers during certain times of the day to limit usage.
        </li>
        <li><strong>Set Tech-Free Hours:</strong> Schedule 1-2 hours every day for no phone usage. Use this time to engage in hobbies, socialize, or do physical activities.
        </li>
    </ul>

    <h3>Food Habits:</h3>
    <ul>
        <li><strong>Mindful Eating:</strong> When you eat, put your phone down. Focus on enjoying the food, improving digestion, and reducing the risk of overeating.
        </li>
    </ul>

    <h3>Exercise:</h3>
    <ul>
        <li><strong>Walk During Phone Use:</strong> If you need to check emails or messages, do so while walking to reduce sedentary time.
        </li>
        <li><strong>Start a Screen-Free Hobby:</strong> Engage in an activity that doesn’t involve a screen, like playing an instrument, painting, or outdoor sports.
        </li>
    </ul>`;
    } else if (addictionType === 'gambling') {
      return `<h3>Actions:</h3>
    <ul>
        <li><strong>Limit Access to Gambling Sites or Apps:</strong> Install website blockers or apps that restrict access to gambling platforms during vulnerable times (e.g., evenings or weekends).
        </li>
        <li><strong>Schedule Gambling-Free Days:</strong> Designate 2–3 days a week where you commit to not gambling at all. Use this time for productive activities, such as work, hobbies, or social interactions.
        </li>
        <li><strong>Financial Boundaries:</strong> Set strict limits on how much you’re allowed to gamble per month and never exceed that limit, no matter the circumstances.
        </li>
    </ul>

    <h3>Food Habits:</h3>
    <ul>
        <li><strong>Snack While You Engage in Alternative Hobbies:</strong> When replacing gambling with other activities (e.g., reading or painting), opt for nutritious snacks like carrots, almonds, or fruit slices to stay healthy and avoid stress eating.
        </li>
    </ul>

    <h3>Exercise:</h3>
    <ul>
        <li><strong>Engage in High-Focus Physical Activity:</strong> Try activities that require focus, like yoga, martial arts, or strength training, to keep your mind engaged and away from thoughts of gambling.
        </li>
        <li><strong>Take Long Nature Walks:</strong> Spending time in nature can reduce stress and gambling urges. Try to schedule regular outdoor walks or hikes, especially on days you’re feeling tempted to gamble.
        </li>
    </ul>`;
    }
  } else if (score == 5) {
    if (addictionType === 'drug') {
      return `<h3>Actions:</h3>
<ul>
  <li>Immediate professional intervention and rehab treatment are necessary for effective recovery from drug addiction.</li>
</ul>
`;
    } else if (addictionType === 'alcohol') {
      return `<h3>Actions:</h3>
<ul>
  <li>Seek urgent professional treatment and counseling at a rehab center for effective alcohol dependency management.</li>
</ul>
`;
    } else if (addictionType === 'smoking') {
      return ` <h3>Actions:</h3>
    <ul>
        <li>Immediate intervention is required. Seek professional help from rehab centers to avoid life-threatening consequences of smoking addiction.</li>     
    </ul>
    `;
    } else if (addictionType === 'internet') {
      return `<h3>Actions:</h3>
    <ul>
        <li>Professional intervention or digital detox programs are recommended for severe mobile phone addiction.
        </li> 
    </ul>
    `;
    } else if (addictionType === 'gambling') {
      return `
      <h3>Action:</h3>
    <ul>
        <li><strong>Professional Intervention or Rehabilitation:</strong>
            <ul>
                <li>For individuals in the critical stage of gambling addiction, seeking help from a professional counselor or therapist is highly recommended.</li>
                <li>Consider enrolling in a gambling-specific treatment program or digital detox tailored to breaking the gambling habit.</li>
            </ul>
        </li>
    </ul>
    `;
    }
  } else if (score == 1) {
    if (addictionType == 'alcohol') {
      return `<h3>Actions:</h3>
    <ul>
        <li><strong>Track Your Consumption:</strong> Use apps to track your alcohol intake to ensure you stay within safe limits (e.g., one drink per day for women, two for men).</li>
        <li><strong>Plan Alcohol-Free Days:</strong> Establish a habit of going alcohol-free on specific days to ensure you are not developing a dependency.</li>
    </ul>

    <h3>Food Habits:</h3>
    <ul>
        <li><strong>Stay Hydrated:</strong> Drink plenty of water to avoid dehydration that alcohol can cause.</li>
        <li><strong>Boost with B Vitamins:</strong> Alcohol can deplete B vitamins. Eat foods like eggs, leafy greens, and whole grains to keep your levels balanced.</li>
    </ul>

    <h3>Exercise:</h3>
    <ul>
        <li><strong>Aerobic Exercises:</strong> Regular exercise can help maintain your overall health, decreasing the need to use alcohol as a stress reliever.</li>
        <li><strong>Mind-Body Practices:</strong> Yoga and meditation can help in reducing the urge to drink by promoting relaxation and self-awareness.</li>
    </ul>`
    } else if (addictionType == 'smoking') {
      return `<h3>Actions:</h3>
    <ul>
        <li><strong>Educate Yourself on Smoking Risks:</strong> Stay updated on the dangers of smoking through reliable resources. Smoking may not be a current issue, but it’s important to keep it that way by understanding its long-term impacts like lung cancer, heart disease, and stroke.
            <ul>
                <li><em>Example:</em> Follow public health websites like the CDC for updates on tobacco control.</li>
            </ul>
        </li>
        <li><strong>Maintain Social Circles Free of Smoking:</strong> Make sure your environment encourages a healthy, smoke-free lifestyle. Attend non-smoking social events and keep company with non-smokers.</li>
    </ul>

    <h3>Food Habits:</h3>
    <ul>
        <li><strong>Nutrient-Rich Diet:</strong> A diet rich in antioxidants (e.g., berries, oranges) helps prevent oxidative stress, which smoking exacerbates. Keep your body healthy by consuming leafy greens, fruits, and lean proteins.</li>
    </ul>

    <h3>Exercise:</h3>
    <ul>
        <li><strong>Regular Physical Activity:</strong> Regular cardio exercises such as running, swimming, or cycling can help maintain lung capacity and cardiovascular health.</li>
        <li><strong>Yoga & Deep Breathing:</strong> Helps improve lung function and lowers stress, reducing the potential urge to smoke later.</li>
    </ul>
`
    } else if (addictionType == 'internet') {
      return ` <h3>Actions:</h3>
    <ul>
        <li><strong>Set Usage Limits:</strong> Set daily screen time limits on your phone for entertainment apps. Keep track of your phone usage through screen time tracking apps.</li>
        <li><strong>Establish Phone-Free Zones:</strong> Designate specific areas or times where your phone is off-limits (e.g., no phones at dinner or before bed).</li>
    </ul>

    <h3>Food Habits:</h3>
    <ul>
        <li><strong>Avoid Mindless Snacking:</strong> Using your phone during meals can lead to mindless eating. Focus on eating whole foods like nuts, fruits, and vegetables without distractions.</li>
    </ul>

    <h3>Exercise:</h3>
    <ul>
        <li><strong>Short, Frequent Breaks:</strong> Get up and walk around after 20-30 minutes of phone use to avoid sedentary behavior.</li>
        <li><strong>Outdoor Activity:</strong> Make time for outdoor activities, like hiking or biking, where phone usage is minimized.</li>
    </ul>`
    }
  }
  return ''; // Default case when no tips are applicable
}
// ************************************************************************ */
exports.getScorePage = (req, res) => {
  return res.render('score');
}

exports.saveAddiction = async (req, res) => {
  const email = req.session.email;
  const { type, quantity, frequency } = req.body;
  if (!email) {
    req.session.redirectTo = '/patient/guidance';
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const userId = req.session.userId;
  const today = new Date();  // Current date to save the entry
  let value;
  // Calculate daily value based on the frequency
  if (frequency === 'per month') {
    value = quantity / 30;
  } else if (frequency === 'per week') {
    value = quantity / 7;
  } else if (frequency === 'per day') {
    value = quantity;
  } else {
    return res.status(400).json({ success: false, error: 'Invalid frequency value' });
  }
  try {
    // Check if there's already an addiction record for this user and type
    const addiction = await Addiction.findOne({ patient: userId, addictionType: type });


    if (addiction) {
      // Get today's date at midnight (start of the day)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Get the last entry in the entries array
      const lastEntry = addiction.entries[addiction.entries.length - 1];

      if (lastEntry) {
        // Normalize the entry date to ignore time
        const entryDate = new Date(lastEntry.date);
        entryDate.setHours(0, 0, 0, 0);

        // Compare the entry date with today's date
        if (entryDate.getTime() === startOfToday.getTime()) {
          return res.status(409).json({ success: false, message: 'Entry for today already exists.' });
        }
      }
      // If the record exists, push today's entry
      addiction.entries.push({ date: today, value: value });
      await addiction.save();
    }
    else {
      // Create a new addiction record if it doesn't exist
      const newAddiction = new Addiction({
        patient: userId,
        addictionType: type,
        entries: [{ date: today, value: value }]
      });
      await newAddiction.save();
    }


    return res.status(200).json({ success: true, message: 'Daily value saved successfully.' });
  } catch (err) {
    console.error('Error saving daily value:', err);
    return res.status(500).json({ error: 'Failed to save daily value' });
  }

  // return res.status(200).json({success: true , message:'Success'});
};
//*****Pateint-Attender-End*****Pateint-Attender-End*****Pateint-Attender-End*****Pateint-Attender-End***** */



// ******Center-DashBoard ******Center-DashBoard ******Center-DashBoard ******Center-DashBoard*********//
exports.getCenterDashboard = async (req, res) => {
  const email = req.session.email;

  try {
    // Find the center by email
    const center = await Center.findOne({ email });

    if (!center) {
      return res.redirect('/login');
    }

    // Find appointments for the center that are not confirmed
    const appointments = await Appointment.find({
      centerEmail: email,
      status: 'Not Confirmed' // Fetch only those with status 'Not Confirmed'
    });

    return res.render('centerdash', { center, appointments });
  } catch (error) {
    console.error('Error fetching data for center dashboard:', error);
    return res.status(500).send('Server Error');
  }
}
// ********************************************************************************************//

// 
exports.postAppoinmentTime = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const time = req.body.time;
    const timeString = String(time);
    // Logic to approve the appointment, e.g., updating the status
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'Approved',
      time: timeString
    });
    const appointment = await Appointment.findById(appointmentId)
    const patientEmail = appointment.patientEmail;
    const patientName = appointment.patientName;
    const formattedAppointmentDate = appointment.appointmentDate;
    const centerName = appointment.centerName;
    const centerEmail = appointment.centerEmail;

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL,
      to: patientEmail,
      subject: `Appointment Approved by ${centerName}`,
      html: `
        <p>Dear ${patientName},</p>
        <p>We are pleased to inform you that your appointment with <strong>${centerName}</strong> has been <strong>approved</strong>.</p>

        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${formattedAppointmentDate}</li>
          <li><strong>Time:</strong> ${timeString}</li>
        </ul>

        <p>Please make sure to arrive at <strong>${centerName}</strong> 10 minutes before your scheduled appointment. If you have any further questions or need to make changes, feel free to contact us at <a href="mailto:${centerEmail}" style="color:rgb(0, 115, 255);">${centerEmail}</a>.</p>

        <p><strong>Best regards,</strong><br>
        The ${centerName} Team</p>
      `
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Schedualed Successfully' }); // Redirect back to appointments page
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
// ********************************************************************************************//

// ******Center-Cancel-Appointment ******Center-Cancel-Appointment ******Center-Cancel-Appointment******//
exports.postCancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    // Logic to approve the appointment, e.g., updating the status
    await Appointment.findByIdAndUpdate(appointmentId, {
      time: '-',
      status: 'Cancelled'
    });
    const appointment = await Appointment.findById(appointmentId);
    const patientEmail = appointment.patientEmail;
    const patientName = appointment.patientName;
    const centerName = appointment.centerName;
    const centerEmail = appointment.centerEmail;
        // Prepare the apology email
        const mailOptions = {
          from: process.env.EMAIL,
          to: patientEmail,
          subject: `Appointment Cancellation from ${centerName}`,
          html: `
            <p>Dear ${patientName},</p>
            <p>We regret to inform you that your appointment with <strong>${centerName}</strong> has been <strong>cancelled</strong>.</p>
            
            <p>We sincerely apologize for any inconvenience this may have caused. If you have any further questions or would like to reschedule, please feel free to contact us at <a href="mailto:${centerEmail}" style="color:rgb(0, 115, 255);">${centerEmail}</a>.</p>
            
            <p><strong>Best regards,</strong><br>
            The ${centerName} Team</p>
          `
        };
        await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Cancelled Successfully' }); // Redirect back to appointments page
  } catch (error) {
    console.error('Error Cancelling appointment:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
// ********************************************************************************************//

// ******Event ******Event ******Event ******Event ******Event ******Event ******Event ******// 
exports.postEvent = async (req, res) => {
  const { eventName,
    eventDesc,
    eventDateType,
    eventTime,
    centerName,
    centerEmail } = req.body;
  const eventDate = eventDateType.substring(0, 10);
  // Basic validation to ensure all fields are provided
  if (!eventName || !eventDesc || !eventDateType || !eventTime || !centerName || !centerEmail) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const newEvent = new Event({
      eventName, eventDesc, eventDate, eventTime, centerName, centerEmail
    });
    newEvent.save();
    return res.status(201).json({ success: true, message: 'Event added successfully' });
  } catch (err) {
    console.log('add-events:', err);
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
// *************************************************************************************************************//

// ******Get-Appointments ******Get-Appointments ******Get-Appointments ******Get-Appointments ****** ******Get-Appointments//
exports.getAppointments = async (req, res) => {
  const email = req.params.email;
  const appointments = await Appointment.find({ centerEmail: email, status: 'Approved' }).sort('appointmentDate');

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    const date = appointment.appointmentDate || 'No Date';

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(appointment);
    return acc;
  }, {});

  // Convert object to an array of date-grouped appointments
  const appointmentsByDateArray = Object.keys(appointmentsByDate).map(date => {
    return {
      date,
      appointments: appointmentsByDate[date]
    };
  });
  return res.render('center-view-app', { appointmentsByDate: appointmentsByDateArray });
}

// *************************************************************************************************************//


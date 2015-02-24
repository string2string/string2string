String2string
=========

Created by [David Katz](https://github.com/katzdave), [Harrison Zhao](https://github.com/harrisonzhao), and [Caleb Zulaski](https://github.com/calebzulawski) at [The Cooper Union](cooper.edu).

String2String brings the classic blackboard to the 21st century.

By using strings, pulleys, weights, ultrasonic distance sensing, a radio transmitter, geometry, and some advanced filtering algorithms, we have developed an efficient, non-intrusive and versatile method for encoding a blackboard at a high resolution; all for less than 40 dollars.

You'll have to see it to believe it.

Awards
=====
* HackCooper 2015 most technical hack

Links
=====
* [Hackathon project profile](https://www.hackerleague.org/hackathons/hackcooper-2015/hacks/string2string)<br>
* [Demo video](https://www.youtube.com/watch?v=y1aw0IiamFM)

Structure of the project
=====
* The arduino code can found in the <b>arduino/sonar</b> folder.<br>
* The program that serializes the sensor data from the arduino into x,y coordinates is found in the <b>client</b> folder.<br>
* The webapp that streams the board data to the website in real time can be found in the <b>webapp</b> folder.

The README.md in each folder will explain how to set up the project.

Technical Details:
=========
A chalk-holder is attached to two strings, each connected over a pulley to a weight. The weights sit in static equilibrium, so they serve the purpose of keeping the string taut without negatively interfering with the writer.

An ultrasonic distance sensor is pointed upward in each tube at the weight. Because the speed of sound is known, by sending an ultrasonic signal, and tracking the time it takes for the signal to hit the weight and return to the transmitter, we can effectively measure the distance from each sensor to its corresponding weight.

With only two calibration points, one at each pulley, we can determine both the board width and all other necessary parameters for position estimation. In other words our algorithm, is generic in that it will work immediately on any similar setup of potentially different size, making this widely applicable to blackboard setups of all types.

The algorithm works by computing the difference between the position of each weight in the current and calibration position, effectively allowing us to accurately measure the distance of the chalk-holder from each pulley. This gives us an approximation of each of the three sides of the string, string, top of board triangle. From there, by applying the law of cosines, we can convert the position of the chalk-holder to x,y coordinates.

Using a wireless radio transmitter attached to a button, writing is only digitized when the button is pressed. A second button exists to erase the current state of the board.

Initially our results were plagued with noise. The smooth path the user took become jagged and crooked. This was because of both noise from the sensors, and a lack of points resulting in sloppy interpolation. We combated this issue on both the backend and the frontend.

On the backend we settled on a Savitsky-Golay Filter. This filter fits successive sub-sets of adjacent data points with a low-degree polynomial by the method of linear least squares. In other words, we take small, overlapping batches of points and create a predictive model of the position of the pen. In doing so, most of the sensor noise is effectively filtered away.

On the frontend we used the method of cardinal splines. This method constructs curves to interpolate between the points based on the same physical properties of flexible rods. We also transmitted points to the frontend with x scaled from 0 to 1 allowing the browser to intelligently scale the image regardless of a user’s computer’s resolution.

In addition to providing a live stream of the board, users have the ability to download a digital copy of notes. Each time the board is reset, the final state of the board is logged in the sidebar for users to download previous states as an image. If only text is written, this images are perfectly suited for optical character recognition.

What makes String2String truly effective though is the cost. Each of our distance sensors, costs only 50 cents. The total estimated cost for all of our materials including pvcpipe, some weights/pulleys, and an Arduino, is under 40 dollars and can easily be halfed by using a less expensive microcontroller.

In terms of our technical stack, the raw sensor data was transmitted from an Arduino to a Python program over serial. This Python program computes the filtered positions of the pen, and transmits these to our main Node.js server which we set up using IBM Bluemix. From there, users can connect to our website to access all of the data present on the server. The client was written in javascript using both Angular and Node.js.

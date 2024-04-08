# Meetup x Pokemon
Meetup x Pokemon is a partial clone of "Meetup", a social platform for connecting people with similar interests. It is themed for people in the Kanto region of the Pokemon series. This is my first full stack application and was completed in two weeks. Future functionality includes AWS S3 implementation and polishing for a better user experience.

# Live Link
https://royce-meetup-project.onrender.com

## Tech Stack
### Framework and Libraries
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)![Sequelize](https://img.shields.io/badge/sequelize-323330?style=for-the-badge&logo=sequelize&logoColor=blue)![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

### Database:
 ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

 ### Hosting:
 ![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

# Index
[Feature List] | [Database Schema] | [User Stories] | [Wireframes]

# Landing Page
![chrome_Kn1ZIqXLrw](https://github.com/jiangroyce/API-Project/assets/145378433/962e74e6-4bf1-409a-b6d4-21504ba090a4)
# Groups
![chrome_T2arN5mZOT](https://github.com/jiangroyce/API-Project/assets/145378433/04f3c86e-ef8d-40e7-adac-29e30d0291f6)
# Events
![chrome_3RhrQy3MYp](https://github.com/jiangroyce/API-Project/assets/145378433/98592949-93f9-4c32-9432-f65916036bc7)
# Select Endpoints
## [Click Here ](backend/README.md)For all API Endpoints
## Session
| Request | Purpose | Return Value | Errors
| :----------------------------- | :--------------------: | :------------------------------ | :------------------------------
 GET /api/session       | Returns the information about the current user that is logged in                                 | {<br>&nbsp;"user" :  <br>&nbsp;&nbsp;{ <br>&nbsp;&nbsp;&nbsp;"id": INT, <br>&nbsp;&nbsp;&nbsp;"firstName": STRING, <br>&nbsp;&nbsp;&nbsp;"lastName": STRING, <br>&nbsp;&nbsp;&nbsp;"email": STRING, <br>&nbsp;&nbsp;&nbsp;"username": STRING <br>&nbsp;&nbsp;} <br>}<br><br>Status: 200<br>|{<br>&nbsp;"user" : null<br>}<br><br>Status: 200
 POST /api/session       | Logs in a current user with valid credentials and returns the current user's information.                                 | {<br>&nbsp;"user" :  <br>&nbsp;&nbsp;{ <br>&nbsp;&nbsp;&nbsp;"id": INT, <br>&nbsp;&nbsp;&nbsp;"firstName": STRING, <br>&nbsp;&nbsp;&nbsp;"lastName": STRING, <br>&nbsp;&nbsp;&nbsp;"email": STRING, <br>&nbsp;&nbsp;&nbsp;"username": STRING <br>&nbsp;&nbsp;} <br>}<br><br>Status: 200<br>| {<br>&nbsp;"message" : "Invalid credentials"<br>}<br><br>Status: 400
POST /api/users       | Creates a new user, logs them in as the current user, and returns the current user's information.                                 | {<br>&nbsp;"user" :  <br>&nbsp;&nbsp;{ <br>&nbsp;&nbsp;&nbsp;"id": INT, <br>&nbsp;&nbsp;&nbsp;"firstName": STRING, <br>&nbsp;&nbsp;&nbsp;"lastName": STRING, <br>&nbsp;&nbsp;&nbsp;"email": STRING, <br>&nbsp;&nbsp;&nbsp;"username": STRING <br>&nbsp;&nbsp;} <br>}<br><br>Status: 200<br>| {<br>&nbsp;"message" : "Validation error"<br>&nbsp;"errors": {<br>&nbsp;&nbsp;"email": "Invalid email"<br>&nbsp;&nbsp;"username": "Username is required"<br>&nbsp;&nbsp;"firstName": "First Name is required"<br>&nbsp;&nbsp;"lastName": "Last Name is required"<br>&nbsp;}<br>}<br><br>Status: 400
## Groups
| Request | Purpose | Return Value | Errors
| :----------------------------- | :--------------------: | :------------------------------ | :------------------------------
 GET /api/groups       | Returns all the groups.                               | {<br>&nbsp;"Groups" :  [<br>&nbsp;&nbsp;{ <br>&nbsp;&nbsp;&nbsp;"id": INT, <br>&nbsp;&nbsp;&nbsp;"organizerId": INT, <br>&nbsp;&nbsp;&nbsp;"name": STRING, <br>&nbsp;&nbsp;&nbsp;"about": STRING, <br>&nbsp;&nbsp;&nbsp;"type": STRING, <br>&nbsp;&nbsp;&nbsp;"private": BOOL, <br>&nbsp;&nbsp;&nbsp;"city": STRING, <br>&nbsp;&nbsp;&nbsp;"state": STRING, <br>&nbsp;&nbsp;&nbsp;"createdAt": STRING, <br>&nbsp;&nbsp;&nbsp;"updatedAt": STRING, <br>&nbsp;&nbsp;&nbsp;"numMembers": INT <br>&nbsp;&nbsp;&nbsp;"previewImage": STRING<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp; ... <br>&nbsp;]<br>}<br><br>Status: 200<br>| -
 GET /api/groups/:groupId       | Returns the details of a group specified by its id.                                 | { <br>&nbsp;&nbsp;&nbsp;"id": INT, <br>&nbsp;&nbsp;&nbsp;"organizerId": INT, <br>&nbsp;&nbsp;&nbsp;"name": STRING, <br>&nbsp;&nbsp;&nbsp;"about": STRING, <br>&nbsp;&nbsp;&nbsp;"type": STRING, <br>&nbsp;&nbsp;&nbsp;"private": BOOL, <br>&nbsp;&nbsp;&nbsp;"city": STRING, <br>&nbsp;&nbsp;&nbsp;"state": STRING, <br>&nbsp;&nbsp;&nbsp;"createdAt": STRING, <br>&nbsp;&nbsp;&nbsp;"updatedAt": STRING, <br>&nbsp;&nbsp;&nbsp;"numMembers": INT <br>&nbsp;&nbsp;&nbsp;"GroupImages": [<br> &nbsp;JSON, ... <br>]<br>&nbsp;&nbsp;&nbsp;"Organizer": {<br> &nbsp;JSON <br>}<br>&nbsp;&nbsp;&nbsp;"Venues": [<br> &nbsp;JSON, ... <br>]<br>&nbsp;&nbsp;}<br><br>Status: 200<br>| {<br>&nbsp;"message" : Group couldn't be found"<br>}<br><br>Status: 404
POST /api/groups       | Creates and returns a new group.                                 | { <br>&nbsp;&nbsp;&nbsp;"id": INT, <br>&nbsp;&nbsp;&nbsp;"organizerId": INT, <br>&nbsp;&nbsp;&nbsp;"name": STRING, <br>&nbsp;&nbsp;&nbsp;"about": STRING, <br>&nbsp;&nbsp;&nbsp;"type": STRING, <br>&nbsp;&nbsp;&nbsp;"private": BOOL, <br>&nbsp;&nbsp;&nbsp;"city": STRING, <br>&nbsp;&nbsp;&nbsp;"state": STRING, <br>&nbsp;&nbsp;&nbsp;"createdAt": STRING, <br>&nbsp;&nbsp;&nbsp;"updatedAt": STRING<br>&nbsp;&nbsp;}<br><br>Status: 201<br>| {<br>&nbsp;"message" : "Validation error"<br>&nbsp;"errors": {<br>&nbsp;&nbsp;"name": "Name must be 60 characters or less"<br>&nbsp;&nbsp;"about": "About must be 50 charaters or more"<br>&nbsp;&nbsp;"type": "Type must be 'Online' or 'In person'"<br>&nbsp;&nbsp;"private": "Private must be a boolean"<br>&nbsp;&nbsp;"city": "City is required"<br>&nbsp;&nbsp;"state": "State is required"<br>&nbsp;}<br>}<br><br>Status: 400

# Feature List
1. Groups
2. Events
3. Venues
4. Group Images
5. Event Images
6. Memberships
7. Attendances

# Future Implementations
1. AWS S3 Image Uploads for all Images
2. Google Maps Integration for all Locations
3. Search Bar
4. Make Pixel Perfect to target site.

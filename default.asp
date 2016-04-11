<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js">
<!--<![endif]-->

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>A&amp;M Desking</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    <!-- build:css(.tmp) styles/main.css -->
    <link rel="stylesheet" href="styles/font-awesome.min.css">
    <!-- <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet"> -->
    <link rel="stylesheet" href="styles/main.css">
    <!-- endbuild -->
    <!-- build:css(.tmp) styles/print.css -->
    <link rel="stylesheet" href="styles/print.css" media="print">
    <!-- endbuild -->
    <!-- build:css(.tmp) styles/svg.css -->
    <link rel="stylesheet" href="styles/svg.css">
    <!-- endbuild -->
    <link rel="stylesheet" href="https://googledrive.com/host/0B1ktlYt5-E-DenRXMFFLRE02bG8/heads.css">

    <!-- build:js scripts/vendor/modernizr.js -->
    <!-- <script src="scripts/modernizr/modernizr.js"></script> -->
    <!-- endbuild -->
    <style id="teamColors" type="text/css"></style>
</head>

<body>
    <!--[if lt IE 10]>
            <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->


    <div class="tabwindow" data-email="">
        <ul class="tabs">
            <li>
                <a href="#locations">Layouts</a>
            </li>
            <li>
                <a href="#deskmoves">Desk Moves</a>
            </li>
            <!-- <li disabled="disabled"> -->
            <li>
                <a href="#deskstats">Desk Stats</a>
            </li>
        </ul>
        <div class="modalhide">
            HIDDEN!
        </div>
        <div class="tab" id="locations" data-mode="proposed">
            <h1>
                  Locations
              </h1>
            <p class="dev">
                Who sits where and such, simply groups to begin with, but deskspaces to follow.
            </p>
            <div class="buttons">
                <div class="slider">
                    <input id="zoomSlider" type="range" min="1" max="5" step="0.05" value="1">
                </div>
                <ul class="viewToggle">
                    <li>
                        <input type="radio" name="view" id="view-Current" checked="checked">
                        <label for="view-Current">
                            Current
                            <i class="icon-chevron-left">
                              </i>
                        </label>
                    </li>
                    <li>
                        <input type="radio" name="view" id="view-Proposed" checked="checked">
                        <label for="view-Proposed">
                            <i class="icon-chevron-right">
                              </i> Proposed
                        </label>
                    </li>
                </ul>
                <select name="floorSelector">
                    <optgroup label="Southwark Street Studios">
                        <option value="4" disabled="disabled">
                            Fourth
                        </option>
                        <option value="3">
                            Third
                        </option>
                        <option value="2">
                            Second
                        </option>
                        <option value="1">
                            First
                        </option>
                        <option value="0">
                            Ground
                        </option>
                        <option value="B">
                            Basement
                        </option>
                    </optgroup>
                    <optgroup label="93 Southwark Street">
                        <option value="nt4">
                            Fourth
                        </option>
                        <option value="nt3">
                            Third
                        </option>
                        <option value="nt2">
                            Second
                        </option>
                        <option value="nt1">
                            First
                        </option>
                        <option value="nt0">
                            Ground
                        </option>
                        <option value="ntB" disabled="disabled">
                            Basement
                        </option>
                    </optgroup>
                    <optgroup label="Isis House">
                        <option value="isis3">
                            Third
                        </option>
                        <option value="isis2">
                            Second
                        </option>
                        <option value="isis1">
                            First
                        </option>

                    </optgroup>
                </select>
                <select name="staffSelector">
                    <option selected="selected" value="">
                        Find a Colleague
                    </option>
                </select>
                <ul class="desk-snippet">
                    <li>
                        <img src="./images/spacer.gif">
                    </li>
                    <li class="name">
                    </li>
                    <li class="deskNumber">
                    </li>
                </ul>
                <div class="savebuttons">
                    <!-- <button class="saveaspdf" disabled="disabled"> -->
                        <!-- Save as PDF -->
                    <!-- </button> -->
                    <!--<form action="https://script.google.com/macros/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec"-->
                    <form action="https://script.google.com/a/macros/alliesandmorrison.com/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec" method="post" accept-charset="utf-8" name="postProposal" class="forms">
                        <input type="hidden" name="tab" value="deskmoves">
                        <button class="saveproposal">
                            Save Proposal
                        </button>
                    </form>
                </div>
            </div>
            <div class="floorplans" data-zoom="1">

                <object class="floorplan annotation" id="scalebar" type="image/svg+xml" data="./images/scalebar.svg">
                </object>

                <object class="floorplan lines" data-floor="1" id="firstfloorplan" type="image/svg+xml" data="./images/southwark-street-1st.svg">
                </object>
                <object class="floorplan lines" data-floor="2" id="secondfloorplan" type="image/svg+xml" data="./images/southwark-street-2nd.svg">
                </object>
                <object class="floorplan lines" data-floor="3" id="thirdfloorplan" type="image/svg+xml" data="./images/southwark-street-3rd.svg">
                </object>
                <object class="floorplan lines" data-floor="B" id="basementplan" type="image/svg+xml" data="./images/southwark-street-basement.svg">
                </object>
                <object class="floorplan lines" data-floor="0" id="groundfloorplan" type="image/svg+xml" data="./images/southwark-street-ground.svg">
                </object>

                <object class="floorplan lines" data-floor="isis1" id="firstfloorisis" type="image/svg+xml" data="./images/isis-house-1st.svg">
                </object>
                <object class="floorplan lines" data-floor="isis2" id="secondfloorisis" type="image/svg+xml" data="./images/isis-house-1st.svg">
                </object>
                <object class="floorplan lines" data-floor="isis3" id="thirdfloorisis" type="image/svg+xml" data="./images/isis-house-1st.svg">
                </object>

                <object class="floorplan lines" data-floor="ntB" id="basementplan93" type="image/svg+xml" data="./images/93-basement.svg">
                </object>
                <object class="floorplan lines" data-floor="nt0" id="groundfloor93" type="image/svg+xml" data="./images/93-ground.svg">
                </object>
                <object class="floorplan lines" data-floor="nt1" id="firstfloor93" type="image/svg+xml" data="./images/93-first.svg">
                </object>
                <object class="floorplan lines" data-floor="nt2" id="secondfloor93" type="image/svg+xml" data="./images/93-second.svg">
                </object>
                <object class="floorplan lines" data-floor="nt3" id="thirdfloor93" type="image/svg+xml" data="./images/93-third.svg">
                </object>
                <object class="floorplan lines" data-floor="nt4" id="fourthfloor93" type="image/svg+xml" data="./images/93-fourth.svg">
                </object>

                <object class="floorplan desks" id="southwarkstreetdesks" type="image/svg+xml" data="./images/desks.svg">
                </object>

            </div>
            <div class="groupList">
                <ul class="displayFilter" data-filter="absent">
                </ul>
            </div>
            <div class="staff-data">
            </div>
            <details class="key" open="open">
                <summary>
                    Key:
                </summary>
                <div class="toggleSwatches">
                </div>
            </details>
        </div>
        <div class="tab" id="deskmoves">
            <h1>
                  Desk Moves
              </h1>
            <p class="dev">Who is moving where and when and whatnot.</p>
            <div class="buttons top">
                <ul class="dateToggle">
                    <li>
                        <input type="radio" name="dateFilter" id="view-All" checked="checked">
                        <label for="view-All">
                            All Moves
                            <i class="icon-chevron-left">
                              </i>
                        </label>
                    </li>
                    <li>
                        <input type="radio" name="dateFilter" id="view-Future">
                        <label for="view-Future">
                            <i class="icon-chevron-right">
                              </i> Future Moves
                        </label>
                    </li>
                </ul>
            </div>
            <table>
                <thead>
                    <tr>
                        <th class="date">Proposed&nbsp;Move /
                            <br>Start&nbsp;/ Leave Date</th>
                        <th>Staff Name</th>
                        <th class="origins">From</th>
                        <th class="destinations">To</th>
                        <th>Project / Team</th>
                        <th class="notes">Notes</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot class="hidden template">
                    <tr data-movetype="template">
                        <td class="picker nocsv">
                            <input type="date" onchange="datePickerChange(this);">
                        </td>
                        <td class="date">
                        </td>
                        <td class="name">
                        </td>
                        <td class="origins">
                        </td>
                        <td class="destinations">
                        </td>
                        <td class="team">
                        </td>
                        <td class="notes" onclick="clickNotes(this);">
                        </td>
                    </tr>
                </tfoot>
            </table>
            <div class="buttons">
                <!--<form action="https://script.google.com/macros/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec"-->
                <form action="https://script.google.com/a/macros/alliesandmorrison.com/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec" method="post" accept-charset="utf-8" name="postProposal" class="forms">
                    <input type="hidden" name="tab" value="deskmoves">
                    <button class="saveproposal">
                        Save Proposal
                    </button>
                </form>
                <button class="concludeMoves">
                    Conclude Moves
                </button>
                <button class="downloadTable">
                    Download as CSV file
                </button>
                <!-- <button class="saveToDrive" disabled="disabled"> -->
                    <!-- Export to Google Docs -->
                <!-- </button> -->
                <button class="emailschedule">
                    Send Schedule by Email
                </button>
            </div>
        </div>
        <div class="tab" id="deskstats">
            <h1>
                  Desk Stats
              </h1>
            <p class="dev">
                How many spare desks and such.
            </p>
            <dl id="resolvedstatslist">
                <dt class="movetally">Proposed Desk Changes</dt>
                <dd class="movetally"></dd>
                
                <dt class="floortally">Floor Tallies<span class="statclarity">Number of Desks per floor per building</span></dt>
                <dd class="floortally"></dd>
                
                <dt class="unseated" style="clear: both;">Unseated staff<span class="statclarity">Staff not allocated a desk per scenario</span></dt>
                <dd class="unseated"></dd>
                
                <dt class="locked">Locked Desks<span class="statclarity">Desks that have been identified as unavailable for seating</span></dt>
                <dd class="locked"></dd>
                
                <dt class="empty">Empty Desks<span class="statclarity">Desks not currently allocated per scenario</span></dt>
                <dd class="empty"></dd>
                
                <dt class="placeholder">Placeholder Desks<span class="statclarity">Desks that have a Team allocated but no Staff Member</span></dt>
                <dd class="placeholder"></dd>
                
                <dt class="noteams">Staff without Teams<span class="statclarity">Desks that have a Staff Member allocated but no Team set</span></dt>
                <dd class="noteams"></dd>
            </dl>
        </div>
        <div class="tab" id="loading" style="display: block">
            <div class="spinner">
                <i class="icon-spinner">
                  </i>
            </div>
        </div>
        <div class="tab default" id="default">
            <p>
                This application will manage the groups, team, seat allocations and provides oversight to studio floor capcity for Allies and Morrison's staff.
            </p>
            <p>
                Certain functions are automated and the templates for email and such are held elsewhere.
            </p>
            <p>
                Application is built to be extendable with new data resources for many of the component parts: Job Resourcing, Hardware, Software, Staff Profile information…
            </p>
        </div>
        <div class="tab" id="auth">
            <p>
                This application will manage the groups, team, seat allocations and provides oversight to studio floor capcity for Allies and Morrison's staff.
            </p>
            <p>
                You must have an active Allies and Morrison Google Apps Account in order to view the data or enact changes.
            </p>
        </div>
    </div>

    <!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> -->
    <!-- <script src="//malsup.github.com/jquery.form.js"></script>  -->
    <!-- <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script> -->

    <!-- build:js scripts/main.js -->
    <script src="scripts/globals.js"></script>
    <!-- endbuild -->

    <!--<script src="https://script.google.com/a/macros/alliesandmorrison.com/s/AKfycbw6uNUWIXx4On55SO_--DssAFWcjWQe5WxAiG1p4FQ9/dev?fn=showDeskData&uriurl=fetch" type="text/javascript"></script>-->

    <!-- build:js scripts/vendor.js -->
    <!-- bower:js -->
    <script type="application/javascript" src="scripts/jquery/jquery.min.js"></script>
    <script type="application/javascript" src="scripts/jquery-form/jquery.form.js"></script>
    <script type="application/javascript" src="scripts/jquery-ui/jquery-ui-1.10.3.custom.min.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:js scripts/main.js -->
    <script type="application/javascript" src="scripts/globals.js"></script>
    <script type="application/javascript" src="scripts/utility.js"></script>
    <script type="application/javascript" src="scripts/color.js"></script>
    <script type="application/javascript" src="scripts/data-loaders.js"></script>
    <script type="application/javascript" src="scripts/data-processing.js"></script>
    <script type="application/javascript" src="scripts/desk-functions.js"></script>
    <script type="application/javascript" src="scripts/desk_moves.js"></script>
    <script type="application/javascript" src="scripts/events.js"></script>
    <script type="application/javascript" src="scripts/table2CSV.js"></script>
    <!-- endbuild -->

    <script src="https://script.google.com/a/macros/alliesandmorrison.com/s/AKfycbxP4Ax7aGi_fP99c5jtp7ekRE80cJfrXu_LlxWSQRmKDwqSwSYS/exec?fn=showDeskData&uriurl=fetch" type="text/javascript"></script>

    <script src="scripts/main.js"></script>

</body>

</html>

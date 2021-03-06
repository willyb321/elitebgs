/*
 * KodeBlox Copyright 2017 Sayak Mukhopadhyay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http: //www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const ebgsFactionsModel = require('../../../models/ebgs_factions');
const ebgsSystemsModel = require('../../../models/ebgs_systems');

module.exports = Journal;

function Journal() {
    this.schemaId = [
        "http://schemas.elite-markets.net/eddn/journal/1",
        "https://eddn.edcd.io/schemas/journal/1"
    ];

    this.trackSystem = function (message) {
        if (message.event === "FSDJump") {
            if (message.Factions) {
                let systemObject = {
                    name: message.StarSystem,
                    name_lower: message.StarSystem.toLowerCase(),
                    x: message.StarPos[0],
                    y: message.StarPos[1],
                    z: message.StarPos[2],
                    government: message.SystemGovernment,
                    allegiance: message.SystemAllegiance,
                    state: message.FactionState,
                    security: message.SystemSecurity,
                    primary_economy: message.SystemEconomy,
                    updated_at: message.timestamp,
                    controlling_minor_faction: message.SystemFaction
                };

                if (message.Powers) {
                    systemObject.power = [];
                    message.Powers.forEach((power) => {
                        systemObject.power.push(power.toLowerCase());
                    });
                    systemObject.power_state = message.PowerplayState;
                }

                let factionArray = [];

                message.Factions.forEach((faction) => {
                    factionArray.push({
                        name: faction.Name,
                        name_lower: faction.Name.toLowerCase()
                    });

                    let historySubObject = {
                        updated_at: message.timestamp,
                        system: message.StarSystem,
                        system_lower: message.StarSystem.toLowerCase(),
                        state: faction.FactionState,
                        influence: faction.Influence
                    }

                    historySubObject.pending_states = [];
                    if (faction.PendingStates) {
                        faction.PendingStates.forEach(pendingState => {
                            let pendingStateObject = {
                                state: pendingState.State,
                                trend: pendingState.Trend
                            };
                            historySubObject.pending_states.push(pendingStateObject);
                        });
                    }
                    historySubObject.recovering_states = [];
                    if (faction.RecoveringStates) {
                        faction.RecoveringStates.forEach(recoveringState => {
                            let recoveringStateObject = {
                                state: recoveringState.State,
                                trend: recoveringState.Trend
                            };
                            historySubObject.recovering_states.push(recoveringStateObject);
                        });
                    };

                    let factionObject = {
                        name: faction.Name,
                        name_lower: faction.Name.toLowerCase(),
                        updated_at: message.timestamp,
                        government: faction.Government,
                        allegiance: faction.Allegiance,
                        $addToSet: {
                            faction_presence: {
                                system_name: message.StarSystem,
                                system_name_lower: message.StarSystem.toLowerCase()
                            },
                            history: historySubObject
                        }
                    };

                    ebgsFactionsModel
                        .then(model => {
                            model.findOneAndUpdate(
                                { name: faction.Name },
                                factionObject,
                                {
                                    upsert: true,
                                    runValidators: true
                                })
                                .exec()
                                .catch((err) => {
                                    console.log(err);
                                })
                        })
                        .catch(err => {
                            console.log(err);
                        });
                });
                systemObject.minor_faction_presences = factionArray;
                ebgsSystemsModel
                    .then(model => {
                        model.findOneAndUpdate(
                            { name: systemObject.name },
                            systemObject,
                            {
                                upsert: true,
                                runValidators: true
                            })
                            .exec()
                            .catch((err) => {
                                console.log(err);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }
    }
}

//Mongoose Models
const Project = require("../models/Project.js")
const Client = require("../models/Client.js")

const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType} = require('graphql')

//client Type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString},
        email: { type: GraphQLString},
        phone: { type: GraphQLString}
    })
});

//project Type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString},
        description: { type: GraphQLString},
        status: { type: GraphQLString},
        client: {
            type: ClientType,
            resolve(parent, args){
                return Client.findById(parent.clientId)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        //list of all projects
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parent, args){
                return Project.find();
            }
        },
        //get One project
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID}},
            resolve(parent, args){
                return Project.findById(args.id)
            }
        },
        //list of clients
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parent, args){
                return Client.find()
            }
        },
        //get One client
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
             return Client.findById(args.id)
            }
        }
    }
});

//Mutation
const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        //add client
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args){
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                });
                return client.save()
            }
        },
        //delete client
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                Project.find({ clientId: args.id }).then((projects)=> {
                    projects.forEach(project => {
                        project.remove();
                    })
                })
                return Client.findByIdAndRemove(args.id)
            }
        },
        //add Project
        addProject: {
            type: ProjectType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                description: { type: GraphQLNonNull(GraphQLString)},
                status: { 
                    type: new GraphQLEnumType({
                    name: 'ProjectStatus',
                    values: {
                        'new': { value: 'Not Started' },
                        'progress': { value: 'In Progress' },
                        'completed': { value: 'Completed'},
                    }
                }),
                defaultValue: 'Not Started'},
                clientId: { type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });
                return project.save();
            }
        },
        //delete project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                return Project.findByIdAndRemove(args.id)
            }
        },
        //Update project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description : { type: GraphQLString },
                status: { 
                    type: new GraphQLEnumType({
                    name: 'ProjectStatusUpdate',
                    values: {
                        'new': { value: 'Not Started' },
                        'progress': { value: 'In Progress' },
                        'new': { value: 'Completed'},
                    }
                })},
            },
            resolve(parent, args){
                return Project.findByIdAndUpdate(args.id, {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status,
                    },
                }, {new: true })
            }
        }

    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})
export default `
query User($username:String) {
    User(name:$username) {
        id
        name
        avatar {
            large
        }
    }
}`;

import { Auth } from 'aws-amplify';

export async function signUp(username, password, email) {
    try {
        const { user } = await Auth.signUp({
            username,
            password,
            attributes: {
                email
            }
        });
        return user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

export async function signIn(username, password) {
    try {
        const user = await Auth.signIn(username, password);
        return user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

export async function signOut() {
    try {
        await Auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const user = await Auth.currentAuthenticatedUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
} 
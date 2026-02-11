import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// 🔥 Async login thunk
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API}/auth/login`,
                userData,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);


// 🔥 Async signup thunk
export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API}/auth/signup`,
                userData,
                { withCredentials: true }
            );
            return response.data;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Signup failed"
            );
        }
    }
);

// 🔥 Get Current User (auto login from cookie)
export const getUser = createAsyncThunk(
    "auth/getUser",
    async (_, { rejectWithValue }) => {
        try {

            const response = await axios.get(
                `${API}/auth/me`,
                { withCredentials: true } // VERY IMPORTANT for cookies
            );

            return response.data;

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user"
            );

        }
    }
);

// 🔥 Logout User
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(
                `${API}/auth/logout`,
                {},
                { withCredentials: true }
            );

            return true;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Logout failed"
            );

        }
    }
);


const initialState = {
    user: null,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // SIGNUP
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })

            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET USER
            .addCase(getUser.pending, (state) => {
                state.loading = true;
            })

            .addCase(getUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })

            .addCase(getUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
            })

            // LOGOUT
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })

            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
            })

            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

    }
});

export default authSlice.reducer;
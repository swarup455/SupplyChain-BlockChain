import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const BASE_URL = `${API}/auth`;

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ userId, password, role }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(
                `${BASE_URL}/login`,
                { userId, password, role },
                { withCredentials: true }
            );
            return data.user;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Login failed."
            );
        }
    }
);

export const getUser = createAsyncThunk(
    "auth/getUser",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(
                `${BASE_URL}/me`,
                { withCredentials: true }
            );
            return data.user;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch user."
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(
                `${BASE_URL}/logout`,
                {},
                { withCredentials: true }
            );
            return true;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Logout failed."
            );
        }
    }
);

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
    user: null,
    isAuthenticated: false,

    loading: {
        login: false,
        logout: false,
        profile: true,
    },

    error: {
        login: null,
        logout: null,
        profile: null,
    },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearErrors(state) {
            state.error = {
                login: null,
                logout: null,
                profile: null,
            };
        },
    },
    extraReducers: (builder) => {

        // ── Login ──────────────────────────────────────────────────────────────
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading.login = true;
                state.error.login = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading.login = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading.login = false;
                state.error.login = action.payload;
            });

        // ── Get User (session restore) ─────────────────────────────────────────
        builder
            .addCase(getUser.pending, (state) => {
                state.loading.profile = true;
                state.error.profile = null;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.loading.profile = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading.profile = false;
                state.error.profile = action.payload;
                // expired / invalid cookie → treat as logged out
                state.user = null;
                state.isAuthenticated = false;
            });

        // ── Logout ─────────────────────────────────────────────────────────────
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading.logout = true;
                state.error.logout = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading.logout = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading.logout = false;
                state.error.logout = action.payload;
                // clear local state even if server call failed
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearErrors } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
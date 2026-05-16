export const getRoleRoute = (role) => {
    switch (role) {
        case "supplier": return "/supplier/dashboard";
        case "manufacturer": return "/manufacturer/dashboard";
        case "distributor": return "/distributor/dashboard";
        case "retailer": return "/retailer/dashboard";
        case "admin": return "/admin/dashboard";
        default: return "/";
    }
};
import streamlit as st
import pandas as pd
import plotly.express as px

# --- Configuration ---
st.set_page_config(
    page_title="QLD Water Markets Dashboard",
    page_icon="💧",
    layout="wide"
)

# --- Data Connection ---
# Ensure these match your GitHub Raw URLs exactly
GITHUB_ALLOCATIONS_URL = "https://github.com/beeches-anode/qld-water-scraper/blob/main/qld_water_allocations.csv"
GITHUB_PLANS_URL = "https://github.com/beeches-anode/qld-water-scraper/blob/main/qld_water_plans.csv"

# Local fallbacks for testing
LOCAL_ALLOCATIONS_FILE = "qld_water_allocations.csv"
LOCAL_PLANS_FILE = "qld_water_plans.csv"

@st.cache_data(ttl=3600)
def load_data():
    data_source = "GitHub (Live)"
    
    # Load Allocations Data
    try:
        df_alloc = pd.read_csv(GITHUB_ALLOCATIONS_URL)
    except:
        try:
            df_alloc = pd.read_csv(LOCAL_ALLOCATIONS_FILE)
            data_source = "Local File"
        except FileNotFoundError:
            df_alloc = None

    # Load Plans Data
    try:
        df_plans = pd.read_csv(GITHUB_PLANS_URL)
    except:
        try:
            df_plans = pd.read_csv(LOCAL_PLANS_FILE)
        except FileNotFoundError:
            df_plans = None

    # Cleanup Allocations Data
    if df_alloc is not None:
        df_alloc.fillna(0, inplace=True)
        
        # Rename 'Water Plan' to 'Water Area' if the scraper output still has the old name
        if 'Water Plan' in df_alloc.columns and 'Water Area' not in df_alloc.columns:
             df_alloc.rename(columns={'Water Plan': 'Water Area'}, inplace=True)
             
        # Ensure Scheme column exists
        if 'Scheme' not in df_alloc.columns:
             df_alloc['Scheme'] = 'Unknown'

    # Cleanup Plans Data
    if df_plans is not None:
        df_plans.fillna("Unknown", inplace=True)

    return df_alloc, df_plans, data_source

# --- Load Data ---
df_alloc, df_plans, source = load_data()

# --- Sidebar ---
st.sidebar.title("💧 Navigation")
view_mode = st.sidebar.radio("Select View", ["🌊 Water Markets (Allocations)", "📜 Water Plans (Status)"])

st.sidebar.markdown("---")

# ==========================================
# VIEW 1: MARKET ALLOCATIONS
# ==========================================
if view_mode == "🌊 Water Markets (Allocations)" and df_alloc is not None:
    # --- Market Filters ---
    st.sidebar.header("Market Filters")
    
    # 1. Water Area Filter
    # Robust check for the column name
    area_col = 'Water Area' if 'Water Area' in df_alloc.columns else 'Water Plan'
    
    areas = sorted(df_alloc[area_col].unique())
    selected_areas = st.sidebar.multiselect("Select Water Area", areas, default=areas[:3]) 
    
    # Filter Data
    if selected_areas:
        df_filtered = df_alloc[df_alloc[area_col].isin(selected_areas)]
    else:
        df_filtered = df_alloc

    # 2. Scheme Filter
    schemes = sorted(df_filtered['Scheme'].unique())
    selected_schemes = st.sidebar.multiselect("Select Scheme", schemes, default=schemes)
    
    if selected_schemes:
        df_filtered = df_filtered[df_filtered['Scheme'].isin(selected_schemes)]

    # 3. Priority Filter
    if 'Priority Group' in df_filtered.columns:
        priorities = sorted(df_filtered['Priority Group'].unique())
        selected_priorities = st.sidebar.multiselect("Priority Group", priorities, default=priorities)
        
        if selected_priorities:
            df_filtered = df_filtered[df_filtered['Priority Group'].isin(selected_priorities)]

    # --- Main Dashboard Content ---
    st.title("Water Allocations & Trading")
    st.caption(f"Source: {source} | Showing {len(df_filtered)} records")

    # KPIs
    col1, col2, col3 = st.columns(3)
    total_vol = df_filtered['Current Volume (ML)'].sum()
    total_cap = df_filtered['Maximum Volume (ML)'].sum()
    
    with col1:
        st.metric("Current Volume Allocated", f"{total_vol:,.0f} ML")
    with col2:
        st.metric("Total Max Capacity", f"{total_cap:,.0f} ML")
    with col3:
        headroom = df_filtered['Trading Headroom (ML)'].sum()
        st.metric("Total Trading Headroom", f"{headroom:,.0f} ML", help="Space available for trading IN to zones")

    tab1, tab2 = st.tabs(["📊 Charts", "📋 Data Table"])

    with tab1:
        st.subheader("Volume by Zone")
        
        if not df_filtered.empty:
            # Stacked Bar: Current vs Headroom
            df_melt = df_filtered.melt(
                id_vars=['Zone/Location', 'Scheme', 'Priority Group'], 
                value_vars=['Current Volume (ML)', 'Trading Headroom (ML)'],
                var_name='Metric', value_name='Volume'
            )
            
            fig = px.bar(
                df_melt, 
                x="Zone/Location", 
                y="Volume", 
                color="Metric",
                title="Water Availability by Zone",
                color_discrete_map={'Current Volume (ML)': '#1f77b4', 'Trading Headroom (ML)': '#2ca02c'},
                height=600
            )
            # Use 'width' argument to prevent future warnings, or fallback to standard
            try:
                st.plotly_chart(fig, use_container_width=True)
            except TypeError:
                st.plotly_chart(fig)
        else:
            st.warning("No data available for selected filters.")

    with tab2:
        # Styling columns for better readability
        format_dict = {
            "Current Volume (ML)": "{:,.0f}",
            "Maximum Volume (ML)": "{:,.0f}", 
            "Trading Headroom (ML)": "{:,.0f}",
            "Minimum Volume (ML)": "{:,.0f}"
        }
        
        if not df_filtered.empty:
            try:
                # Try to apply green gradient to Headroom column
                st.dataframe(
                    df_filtered.style.format(format_dict).background_gradient(subset=['Trading Headroom (ML)'], cmap="Greens"),
                    use_container_width=True
                )
            except ImportError:
                # Fallback if matplotlib is missing
                st.dataframe(df_filtered, use_container_width=True)
            except KeyError:
                 # Fallback if column doesn't exist
                st.dataframe(df_filtered, use_container_width=True)

# ==========================================
# VIEW 2: WATER PLANS
# ==========================================
elif view_mode == "📜 Water Plans (Status)" and df_plans is not None:
    st.title("Queensland Water Plans Status")
    st.markdown("Overview of the strategic water plans, their expiry dates, and review status.")
    
    # Metrics
    total_plans = len(df_plans)
    # Handle string matching safely
    expiring_soon = 0
    if 'Estimated Expiry' in df_plans.columns:
        expiring_soon = len(df_plans[df_plans['Estimated Expiry'].astype(str).str.contains('2025|2026', na=False)])
    
    m1, m2 = st.columns(2)
    m1.metric("Total Water Plans", total_plans)
    m2.metric("Expiring 2025-26", expiring_soon, delta_color="inverse")

    # Search
    search = st.text_input("Search Plans", placeholder="Type plan name (e.g. 'Fitzroy')...")
    if search:
        df_plans = df_plans[df_plans['Plan Name'].str.contains(search, case=False, na=False)]

    # Display Cards
    for index, row in df_plans.iterrows():
        with st.expander(f"📘 {row.get('Plan Name', 'Unknown Plan')}"):
            st.markdown(f"**Estimated Expiry:** {row.get('Estimated Expiry', 'Unknown')}")
            st.info(f"**Status Summary:**\n\n{row.get('Status Summary', 'No status available.')}")
            if 'URL' in row:
                st.markdown(f"[Read more on Business Queensland]({row['URL']})")

# ==========================================
# ERROR HANDLING
# ==========================================
else:
    st.error("Data files not found. Please run the GitHub Action scraper first!")
    st.write("The dashboard is looking for:")
    st.code(f"1. {GITHUB_ALLOCATIONS_URL}\n2. {GITHUB_PLANS_URL}")
    
    if st.button("Retry Load"):
        st.cache_data.clear()
        st.rerun()

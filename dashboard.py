import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# --- Configuration ---
st.set_page_config(
    page_title="QLD Water Markets Dashboard",
    page_icon="💧",
    layout="wide"
)

# --- Data Connection ---
# TODO: REPLACE THIS URL with your raw GitHub URL!
# 1. Go to your GitHub repo -> Click 'qld_water_allocations.csv'
# 2. Click the 'Raw' button (top right of the file view)
# 3. Copy that URL and paste it below.
GITHUB_CSV_URL = "https://github.com/beeches-anode/qld-water-scraper/blob/main/qld_water_allocations.csv" 
LOCAL_CSV_FILE = "qld_water_allocations.csv"

@st.cache_data(ttl=3600) # Cache data for 1 hour so it doesn't reload constantly
def load_data():
    try:
        # First try loading from GitHub (Live Data)
        df = pd.read_csv(GITHUB_CSV_URL)
        source = "GitHub (Live)"
    except Exception:
        try:
            # Fallback to local file if offline
            df = pd.read_csv(LOCAL_CSV_FILE)
            source = "Local File"
        except FileNotFoundError:
            return None, "No data found"

    # Data Cleaning for Display
    # Fill NaNs with 0 for calculation
    df.fillna(0, inplace=True)
    return df, source

# --- Load Data ---
df_raw, data_source = load_data()

# --- Sidebar Filters ---
st.sidebar.title("💧 Filters")

if df_raw is not None:
    # 1. Water Plan Filter
    plans = sorted(df_raw['Water Plan'].unique())
    selected_plans = st.sidebar.multiselect("Select Water Plan", plans, default=plans)
    
    # Filter dataframe based on Plan selection
    df_filtered = df_raw[df_raw['Water Plan'].isin(selected_plans)]

    # 2. Scheme Filter (Dynamic based on Plan)
    schemes = sorted(df_filtered['Scheme'].unique())
    selected_schemes = st.sidebar.multiselect("Select Scheme", schemes, default=schemes)
    
    # Filter dataframe based on Scheme selection
    df_filtered = df_filtered[df_filtered['Scheme'].isin(selected_schemes)]

    # 3. Priority Filter
    priorities = sorted(df_filtered['Priority Group'].unique())
    selected_priorities = st.sidebar.multiselect("Priority Group", priorities, default=priorities)
    
    # Final Filter
    df_final = df_filtered[df_filtered['Priority Group'].isin(selected_priorities)]
    
    # --- Main Dashboard ---
    st.title("Queensland Water Markets Dashboard")
    st.caption(f"Data Source: {data_source} | Total Records: {len(df_final)}")
    st.markdown("---")

    # KPI Metrics
    col1, col2, col3, col4 = st.columns(4)
    
    total_vol = df_final['Current Volume (ML)'].sum()
    total_cap = df_final['Maximum Volume (ML)'].sum()
    total_headroom = df_final['Trading Headroom (ML)'].sum()
    
    with col1:
        st.metric("Total Water Allocated", f"{total_vol:,.0f} ML")
    with col2:
        st.metric("Total Zone Capacity", f"{total_cap:,.0f} ML")
    with col3:
        # Calculate % Full (avoid divide by zero)
        pct_full = (total_vol / total_cap * 100) if total_cap > 0 else 0
        st.metric("Overall Usage", f"{pct_full:.1f}%")
    with col4:
        st.metric("Total Trading Headroom", f"{total_headroom:,.0f} ML", help="Available space remaining in zones (Max - Current)")

    # Tabs for different views
    tab1, tab2, tab3 = st.tabs(["📊 Trading Analysis", "🌍 Sunburst Overview", "📋 Raw Data"])

    with tab1:
        st.subheader("Zone Availability & Headroom")
        st.markdown("This chart shows the **Current Volume** (Blue) vs **Available Headroom** (Green). Green bars indicate zones where you can likely trade water *into*.")
        
        # Stacked Bar Chart: Current vs Headroom
        # We need to melt the dataframe to stack the bars correctly
        df_melt = df_final.melt(
            id_vars=['Zone/Location', 'Scheme', 'Priority Group'], 
            value_vars=['Current Volume (ML)', 'Trading Headroom (ML)'],
            var_name='Type', value_name='Volume'
        )
        
        fig_bar = px.bar(
            df_melt, 
            x="Zone/Location", 
            y="Volume", 
            color="Type",
            hover_data=['Scheme', 'Priority Group'],
            color_discrete_map={'Current Volume (ML)': '#1f77b4', 'Trading Headroom (ML)': '#2ca02c'},
            title="Zone Capacity: Used vs. Available",
            height=600
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with tab2:
        st.subheader("Water Distribution Hierarchy")
        st.markdown("Click on the rings to drill down from **Plan** -> **Scheme** -> **Zone**.")
        
        # Sunburst Chart
        fig_sun = px.sunburst(
            df_final, 
            path=['Water Plan', 'Scheme', 'Zone/Location'], 
            values='Current Volume (ML)',
            color='Current Volume (ML)',
            color_continuous_scale='Blues',
            height=700
        )
        st.plotly_chart(fig_sun, use_container_width=True)

    with tab3:
        st.subheader("Detailed Data Table")
        
        # Styling the dataframe
        st.dataframe(
            df_final.style.format({
                "Current Volume (ML)": "{:,.0f}",
                "Maximum Volume (ML)": "{:,.0f}",
                "Trading Headroom (ML)": "{:,.0f}",
                "Minimum Volume (ML)": "{:,.0f}",
            }).background_gradient(subset=['Trading Headroom (ML)'], cmap="Greens"),
            use_container_width=True
        )

else:
    st.error("Data could not be loaded. Please check:")
    st.code(f"1. Does the file '{LOCAL_CSV_FILE}' exist locally?\n2. Is the GITHUB_CSV_URL correct?\n3. Did the scraper run successfully?")
    if st.button("Reload Data"):
        st.cache_data.clear()
        st.experimental_rerun()
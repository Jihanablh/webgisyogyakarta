import os

def split_css(input_file):
    os.makedirs('css', exist_ok=True)
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    current_file = 'css/main.css'
    file_handles = {}
    
    # Pre-open files based on category mapping
    category_mapping = {
        'Map': 'css/main.css',
        'Sidebar': 'css/sidebar.css',
        'Search': 'css/sidebar.css',
        'Category Accordion': 'css/sidebar.css',
        'Stats': 'css/sidebar.css',
        'Sidebar Footer': 'css/sidebar.css',
        'Sidebar Toggle': 'css/sidebar.css',
        'Info Card': 'css/detail-panel.css',
        'Loading & Toast': 'css/components.css',
        'Badges & Colors': 'css/components.css',
        'Modals': 'css/components.css',
        'Stats Modal': 'css/components.css',
        'Report Modal': 'css/components.css',
        'Responsive': 'css/main.css',
        'Top Navigation': 'css/main.css',
        'SPA Containers': 'css/main.css',
        'Report Page': 'css/pages.css',
        'Statistics Page': 'css/pages.css',
        'About Page': 'css/pages.css',
        'Welcome Screen': 'css/welcome.css'
    }
    
    for val in set(category_mapping.values()):
        file_handles[val] = open(val, 'w', encoding='utf-8')
    
    # We also need to map the first few lines to main.css
    file_handles['css/main.css'].write("/* Core Styles */\n")
    
    for line in lines:
        if line.startswith('/* --- '):
            # Extract category name
            cat = line.replace('/* --- ', '').replace(' --- */', '').strip()
            # Map category to file
            if cat in category_mapping:
                current_file = category_mapping[cat]
            else:
                # If unknown, append to components
                current_file = 'css/components.css'
            
            file_handles[current_file].write('\n' + line)
        else:
            file_handles[current_file].write(line)
            
    for f in file_handles.values():
        f.close()

if __name__ == '__main__':
    split_css('style.css')

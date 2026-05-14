<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.34" styleCategories="Symbology|Labeling|Fields">
  <renderer-v2 attr="kelas_dampak" type="categorizedSymbol" symbollevels="0" enableorderby="0" forceraster="0">
    <categories>
      <category value="Tidak ada kejadian" label="Tidak ada kejadian" symbol="0" render="true"/>
      <category value="Rendah" label="Rendah" symbol="1" render="true"/>
      <category value="Sedang" label="Sedang" symbol="2" render="true"/>
      <category value="Tinggi" label="Tinggi" symbol="3" render="true"/>
      <category value="Sangat Tinggi" label="Sangat Tinggi" symbol="4" render="true"/>
      <category value="Data belum tersedia" label="Data belum tersedia / belum tervalidasi" symbol="5" render="true"/>
    </categories>
    <symbols>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="0">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="245,245,245,255"/>
          <prop k="outline_color" v="110,110,110,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="1">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="255,205,213,255"/>
          <prop k="outline_color" v="130,60,60,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="2">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="244,114,136,255"/>
          <prop k="outline_color" v="120,40,40,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="3">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="220,38,38,255"/>
          <prop k="outline_color" v="90,20,20,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="4">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="127,29,29,255"/>
          <prop k="outline_color" v="60,10,10,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="solid"/>
        </layer>
      </symbol>
      <symbol alpha="1" clip_to_extent="1" type="fill" name="5">
        <layer class="SimpleFill" enabled="1">
          <prop k="color" v="229,231,235,255"/>
          <prop k="outline_color" v="156,163,175,255"/>
          <prop k="outline_width" v="0.25"/>
          <prop k="style" v="dense4"/>
        </layer>
      </symbol>
    </symbols>
  </renderer-v2>
  <labeling type="simple">
    <settings>
      <text-style fieldName="kecamatan" namedStyle="Regular" fontSize="8" fontFamily="Arial"/>
      <placement placement="1"/>
    </settings>
  </labeling>
  <fieldConfiguration>
    <field name="provinsi"><editWidget type="TextEdit"/></field>
    <field name="kab_kota"><editWidget type="TextEdit"/></field>
    <field name="kecamatan"><editWidget type="TextEdit"/></field>
    <field name="tahun"><editWidget type="TextEdit"/></field>
    <field name="periode"><editWidget type="TextEdit"/></field>
    <field name="jumlah_kejadian"><editWidget type="TextEdit"/></field>
    <field name="jumlah_dampak"><editWidget type="TextEdit"/></field>
    <field name="meninggal"><editWidget type="TextEdit"/></field>
    <field name="luka_luka"><editWidget type="TextEdit"/></field>
    <field name="hilang"><editWidget type="TextEdit"/></field>
    <field name="mengungsi"><editWidget type="TextEdit"/></field>
    <field name="rumah_rusak"><editWidget type="TextEdit"/></field>
    <field name="kelas_dampak"><editWidget type="TextEdit"/></field>
    <field name="sumber_data"><editWidget type="TextEdit"/></field>
    <field name="tanggal_akses"><editWidget type="TextEdit"/></field>
    <field name="catatan_validasi"><editWidget type="TextEdit"/></field>
  </fieldConfiguration>
</qgis>

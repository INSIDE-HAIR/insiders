import { HierarchyItem } from "../types/drive";

/**
 * Datos de ejemplo para probar la visualización jerárquica
 * basados en estructuras reales del proyecto
 */
export const mockHierarchyData: HierarchyItem = {
  id: "1uksAN7jXW_xhNcLhKP2EIBZGDS8QJqmF",
  name: "Insiders - Materiales Marketing",
  driveType: "folder",
  depth: 0,
  order: 1,
  childrens: [
    // 01_sidebar_Plan de Marketing
    {
      id: "1oF9mtX22yvCW62ADCfpWBYf9V1ULDz85",
      name: "01_sidebar_Plan de Marketing",
      driveType: "folder",
      depth: 1,
      order: 1,
      childrens: [
        {
          id: "17ihS996JwECC7ofsh3OW7K38kMK5aGD8",
          name: "01_button_Enlace de formulario.txt",
          driveType: "file",
          depth: 2,
          order: 1,
          childrens: [],
        },
        {
          id: "157TW6f4RcDLaRZBT4BBEjrnUeU7XYI_h",
          name: "02_tabs",
          driveType: "folder",
          depth: 2,
          order: 2,
          childrens: [
            {
              id: "1v4sm88bIhajeFRo2yx1lZWgr1FCH07xu",
              name: "01_tab_Contexto",
              driveType: "folder",
              depth: 3,
              order: 1,
              childrens: [
                {
                  id: "1jwifdnEMijKftTWGhpGmuuII1A8tqk84",
                  name: "01_vimeo_contexto.txt",
                  driveType: "file",
                  depth: 4,
                  order: 1,
                  childrens: [],
                },
              ],
            },
            {
              id: "16kjewIhGSLkO6xFmD_4w_7WwjdNH4_Bo",
              name: "02_tab_Acción Principal_hidden",
              driveType: "folder",
              depth: 3,
              order: 2,
              childrens: [
                {
                  id: "1euQhBT2MwVS0GLzBhEnZWxfqP2wzwVTU",
                  name: "01_vimeo_Acción Principal.txt",
                  driveType: "file",
                  depth: 4,
                  order: 1,
                  childrens: [],
                },
              ],
            },
          ],
        },
      ],
    },

    // 02_sidebar_Guia
    {
      id: "17TjoI1HAcokqDHqCuuE9LkaIl8QuwPdF",
      name: "02_sidebar_Guia",
      driveType: "folder",
      depth: 1,
      order: 2,
      childrens: [
        {
          id: "1EhUzOlbbIPCF9q5OQgVsOQtwkNsMl-_Y",
          name: "A-A-2503-0002-01-00-01.pdf",
          driveType: "file",
          depth: 2,
          order: 1,
          childrens: [],
        },
        {
          id: "1-xYSScBcaGSAvygt9XojDBTbSH1eXcw7",
          name: "A-A-2503-0002-01-00-01-P1.jpg",
          driveType: "file",
          depth: 2,
          order: 2,
          childrens: [],
        },
      ],
    },

    // 03_sidebar_Listas de Control
    {
      id: "1vqGs_32_qSZZ6q_XZUJI94z7PJAeVwc-",
      name: "03_sidebar_Listas de Control",
      driveType: "folder",
      depth: 1,
      order: 3,
      childrens: [
        {
          id: "1nYLxCZtapghQ2XW_OfS9OMXhpP6nbiAc",
          name: "01_section_Manager",
          driveType: "folder",
          depth: 2,
          order: 1,
          childrens: [
            {
              id: "1f4cnYBPusPBXFFfcq_YxARc9ZkYaEf-w",
              name: "A-A-2503-1111-01-00-01.pdf",
              driveType: "file",
              depth: 3,
              order: 1,
              childrens: [],
            },
            {
              id: "1S9yZVZCIagwo-m2M5dykbsPOxVuEoFgK",
              name: "A-A-2503-1111-01-00-01-P1.jpg",
              driveType: "file",
              depth: 3,
              order: 2,
              childrens: [],
            },
          ],
        },
        {
          id: "1kGvD3yOQQaYYmCFHI9LjK8BokYr_M7vG",
          name: "02_section_Colaboradores",
          driveType: "folder",
          depth: 2,
          order: 2,
          childrens: [
            {
              id: "1rbVc4OYKcTriX66Eayynmy4lz3B8qi-v",
              name: "A-A-2503-1112-01-00-01.pdf",
              driveType: "file",
              depth: 3,
              order: 1,
              childrens: [],
            },
            {
              id: "1fOoIG0_ezJGFvaVoOsOSJDsRN-2B0PTV",
              name: "A-A-2503-1112-01-00-01-P1.jpg",
              driveType: "file",
              depth: 3,
              order: 2,
              childrens: [],
            },
            // Ejemplo de sección que contiene tabs (añadido para demostrar esta capacidad)
            {
              id: "1Dc45ZXGy_tabs_docs_adicionales",
              name: "03_tabs_Documentos Adicionales",
              driveType: "folder",
              depth: 3,
              order: 3,
              childrens: [
                {
                  id: "1Ej32kTBh_tab_normativa",
                  name: "01_tab_Normativa",
                  driveType: "folder",
                  depth: 4,
                  order: 1,
                  childrens: [
                    {
                      id: "1Fu43LpQw_normativa_interna",
                      name: "Normativa interna.pdf",
                      driveType: "file",
                      depth: 5,
                      order: 1,
                      childrens: [],
                    },
                  ],
                },
                {
                  id: "1Gk65MsRt_tab_procedimientos",
                  name: "02_tab_Procedimientos",
                  driveType: "folder",
                  depth: 4,
                  order: 2,
                  childrens: [
                    {
                      id: "1Hp76NuVy_procedimiento_control",
                      name: "Procedimiento de control.pdf",
                      driveType: "file",
                      depth: 5,
                      order: 1,
                      childrens: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // 04_sidebar_Contenido físico
    {
      id: "116vMk5OR-6vX3xUw26q2j7p7Ia6IO_LD",
      name: "04_sidebar_Contenido físico",
      driveType: "folder",
      depth: 1,
      order: 4,
      childrens: [
        {
          id: "1G58gE2r2hYKUJ7wdUYR730-TQl-dkE9Q",
          name: "01_tabs",
          driveType: "folder",
          depth: 2,
          order: 1,
          childrens: [
            {
              id: "1GUPHsitSeB9VcEYPMOHr8v1I4bXf_Clk",
              name: "01_tab_Cartelería Exterior",
              driveType: "folder",
              depth: 3,
              order: 1,
              childrens: [
                {
                  id: "1ujG29oAxM-R7LAI5jE7lrnelx6JNvPTr",
                  name: "01_modal/TODAS LAS ZONAS copia 19@2x.png",
                  driveType: "file",
                  depth: 4,
                  order: 1,
                  childrens: [],
                },
                {
                  id: "1LXmpIi48hl-GWvwN8sCM7VvgPYu2Zj3p",
                  name: "02_tabs",
                  driveType: "folder",
                  depth: 4,
                  order: 2,
                  childrens: [
                    {
                      id: "1tm5ODM6m8IoaMGJyDhNcpnriqBhV0HL7",
                      name: "01_tab_Spanish",
                      driveType: "folder",
                      depth: 5,
                      order: 1,
                      childrens: [
                        {
                          id: "1G9AL8i9VLDCE8CG-z8eLGV5VMyu1tNqp",
                          name: "01_section_Cartel 80x120cm",
                          driveType: "folder",
                          depth: 6,
                          order: 1,
                          childrens: [
                            {
                              id: "1jwH5r7WqImzivTzdOtFgF-i553-V2RLO",
                              name: "Copia de A-A-2503-0080-01-00-01.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 1,
                              childrens: [],
                            },
                            {
                              id: "1iSsNrmXP39e8Pwqds99NwqklQ0RF4T7y",
                              name: "Copia de A-A-2503-0080-01-00-02.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 2,
                              childrens: [],
                            },
                          ],
                        },
                        {
                          id: "1fihfPEuRaMTfniQYLAAUDphUKX9DkV05",
                          name: "02_section_Cartel 50x70cm",
                          driveType: "folder",
                          depth: 6,
                          order: 2,
                          childrens: [
                            {
                              id: "1wGoPvt5Ilh1-0f0Ufq-ys8E6grUXbxgO",
                              name: "Copia de A-A-2503-0050-01-00-01.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 1,
                              childrens: [],
                            },
                            {
                              id: "1LyqeoPxhyQwj8j8FgnUtUgBja6M3FAu2",
                              name: "Copia de A-A-2503-0050-01-00-02.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 2,
                              childrens: [],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: "1QS5lAMNis7a1DVSUwjrmbPuBxBQyRbLd",
                      name: "02_tab_Catalá",
                      driveType: "folder",
                      depth: 5,
                      order: 2,
                      childrens: [
                        {
                          id: "1Gq0KJLN6T1PEG4gCGPItZNuhWFYNIxC1",
                          name: "01_section_Cartel 80x120cm",
                          driveType: "folder",
                          depth: 6,
                          order: 1,
                          childrens: [
                            {
                              id: "1j3b3BXTSNBy4jM2iOKFMqEthMRTZSOwN",
                              name: "Copia de A-A-2503-0080-02-00-01.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 1,
                              childrens: [],
                            },
                            {
                              id: "1TRs5gt9B4Y4pP4q8wjuFB_jLR_q-zMeT",
                              name: "Copia de A-A-2503-0080-02-00-02.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 2,
                              childrens: [],
                            },
                          ],
                        },
                        {
                          id: "1KJLAQBqbOnIsFg0-8a0flaOqF_XZ4vs7",
                          name: "02_section_Cartel 50x70cm",
                          driveType: "folder",
                          depth: 6,
                          order: 2,
                          childrens: [
                            {
                              id: "1Eg_Qdl6dLipFIBkYOKVWlBCVdWhBxL4R",
                              name: "Copia de A-A-2503-0050-02-00-01.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 1,
                              childrens: [],
                            },
                            {
                              id: "1PDFMBpTLZs6WUJKIJxgxVF-2cWbu1sWy",
                              name: "Copia de A-A-2503-0050-02-00-02.pdf",
                              driveType: "file",
                              depth: 7,
                              order: 2,
                              childrens: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // 06_sidebar_Comunicación semanal
    {
      id: "1NiPAKjfGmUAz0LL3pU-fPm5akDCRukuR",
      name: "06_sidebar_Comunicación semanal",
      driveType: "folder",
      depth: 1,
      order: 6,
      childrens: [
        {
          id: "1oquq78uI3XzXlQhkYDH7YYqNO1zOtfNN",
          name: "01_tabs",
          driveType: "folder",
          depth: 2,
          order: 1,
          childrens: [
            {
              id: "1ivxAFvSlNs8d6XUKP7C4_3Z8IYupPHzf",
              name: "01_tab_Posts semanales",
              driveType: "folder",
              depth: 3,
              order: 1,
              childrens: [
                {
                  id: "13gnRjNtlNZAyFvtsxL-tJ3lYIN6boGJL",
                  name: "01_tabs",
                  driveType: "folder",
                  depth: 4,
                  order: 1,
                  childrens: [
                    {
                      id: "1BymdS9oVuHkg421QYlPp2x1A8tT9q8Q7",
                      name: "01_tab_Semana 1",
                      driveType: "folder",
                      depth: 5,
                      order: 1,
                      childrens: [
                        {
                          id: "1Os4sSNKXq307UWZwqUKSIDNSmklt3ui7",
                          name: "A-A-2503-0192-01-00-01.txt",
                          driveType: "file",
                          depth: 6,
                          order: 1,
                          childrens: [],
                        },
                        {
                          id: "1MCHkiK532VNqQD5gf6daBctveSDsoWzB",
                          name: "Copia de A-A-2503-0192-01-00-01.jpg",
                          driveType: "file",
                          depth: 6,
                          order: 2,
                          childrens: [],
                        },
                        {
                          id: "1uYs4j0pGKpJ64SIJbOp91WjliTRY2zWc",
                          name: "Copia de A-A-2503-0192-01-00-03.png",
                          driveType: "file",
                          depth: 6,
                          order: 3,
                          childrens: [],
                        },
                      ],
                    },
                    {
                      id: "1KcgoZ__wlvc2LDJNBhMfRNDcf8eeN-sR",
                      name: "02_tab_Semana 2",
                      driveType: "folder",
                      depth: 5,
                      order: 2,
                      childrens: [
                        {
                          id: "182HDsNOl_KZiY2Ve1quMVPSW2hUgJZ7g",
                          name: "Copia de A-A-2503-0192-01-00-04.jpg",
                          driveType: "file",
                          depth: 6,
                          order: 1,
                          childrens: [],
                        },
                        {
                          id: "1a-tHpS9rDbxUEtLixHq2jRL4nIQUpsXM",
                          name: "Copia de A-A-2503-0192-01-00-05.png",
                          driveType: "file",
                          depth: 6,
                          order: 2,
                          childrens: [],
                        },
                        {
                          id: "1Y38dqb19uN7BtG6nxtHbM3v6OFM0QOU6",
                          name: "Copia de A-A-2503-0192-01-00-06.png",
                          driveType: "file",
                          depth: 6,
                          order: 3,
                          childrens: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "1609ARV8Xog9lU1csL2Bf_SfxtZJX6lGV",
              name: "02_tab_Stories Semanales",
              driveType: "folder",
              depth: 3,
              order: 2,
              childrens: [
                {
                  id: "18ksNOxGw9dgj_clp1Ll2Oww3JhUVuuIf",
                  name: "01_tabs",
                  driveType: "folder",
                  depth: 4,
                  order: 1,
                  childrens: [
                    {
                      id: "1my0BdWzOoV1t11NBw4WfaqHH7CBqrCKL",
                      name: "01_tab_Semana 1",
                      driveType: "folder",
                      depth: 5,
                      order: 1,
                      childrens: [
                        {
                          id: "1FEEFdUqv_wi3Kxw1HeiBlfkmgvVm7VCh",
                          name: "01_section_Grupo 1",
                          driveType: "folder",
                          depth: 6,
                          order: 1,
                          childrens: [
                            {
                              id: "184CUIUcZELA-7QJOhzrTikx801nmOE5M",
                              name: "Copia de A-A-2503-1109-01-01-01.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 1,
                              childrens: [],
                            },
                            {
                              id: "1Dpp5hjhfm3_ShCZ0p5t7pedye6S0CoPI",
                              name: "Copia de A-A-2503-1109-01-01-02.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 2,
                              childrens: [],
                            },
                            {
                              id: "1aPm7tBgXZcRlOk4BE_LfMGGhc2jvFNO-",
                              name: "Copia de A-A-2503-1109-01-01-03.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 3,
                              childrens: [],
                            },
                            {
                              id: "1I6Z2Zf4m2WUmuXkl--w79mgAMwgwS0nQ",
                              name: "Copia de A-A-2503-1109-01-01-04.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 4,
                              childrens: [],
                            },
                          ],
                        },
                        {
                          id: "1-9OEiWHgdCOeezWb5d1pKTAD0C-IwlbK",
                          name: "02_section_Grupo 2",
                          driveType: "folder",
                          depth: 6,
                          order: 2,
                          childrens: [
                            {
                              id: "1tf0SgqrNt8EfcZ2LPpWIemDkQE6Q_c8L",
                              name: "Copia de A-A-2503-1109-01-02-01.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 1,
                              childrens: [],
                            },
                            {
                              id: "1DbQWMwVgDWlQdKtt2qZta3Kmx4DrqHYg",
                              name: "Copia de A-A-2503-1109-01-02-02.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 2,
                              childrens: [],
                            },
                            {
                              id: "1NsgTwFBheowMwDYjHvyeACbuKHgJ7y17",
                              name: "Copia de A-A-2503-1109-01-02-03.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 3,
                              childrens: [],
                            },
                            {
                              id: "1kzobDOXJbzbquzsA7KPQHLH0Z-jKKVm4",
                              name: "Copia de A-A-2503-1109-01-02-04.jpg",
                              driveType: "file",
                              depth: 7,
                              order: 4,
                              childrens: [],
                            },
                            // Ejemplo de sección que contiene tabs (para demostrar esta capacidad)
                            {
                              id: "1Js87PoQy_tabs_variantes",
                              name: "03_tabs_Variantes",
                              driveType: "folder",
                              depth: 7,
                              order: 5,
                              childrens: [
                                {
                                  id: "1Kt98RvZt_tab_horizontal",
                                  name: "01_tab_Horizontal",
                                  driveType: "folder",
                                  depth: 8,
                                  order: 1,
                                  childrens: [
                                    {
                                      id: "1Lu09SwXy_horizontal_1",
                                      name: "Variante horizontal 1.jpg",
                                      driveType: "file",
                                      depth: 9,
                                      order: 1,
                                      childrens: [],
                                    },
                                    {
                                      id: "1Mv19TxWz_horizontal_2",
                                      name: "Variante horizontal 2.jpg",
                                      driveType: "file",
                                      depth: 9,
                                      order: 2,
                                      childrens: [],
                                    },
                                  ],
                                },
                                {
                                  id: "1Nw20UxVy_tab_vertical",
                                  name: "02_tab_Vertical",
                                  driveType: "folder",
                                  depth: 8,
                                  order: 2,
                                  childrens: [
                                    {
                                      id: "1Ox31VwUz_vertical_1",
                                      name: "Variante vertical 1.jpg",
                                      driveType: "file",
                                      depth: 9,
                                      order: 1,
                                      childrens: [],
                                    },
                                    {
                                      id: "1Py42WvTy_vertical_2",
                                      name: "Variante vertical 2.jpg",
                                      driveType: "file",
                                      depth: 9,
                                      order: 2,
                                      childrens: [],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Mock de tarjetas de marketing para la visualización
 */
export const mockMarketingCards = {
  files: [
    {
      id: "1EhUzOlbbIPCF9q5OQgVsOQtwkNsMl-_Y",
      name: "A-A-2503-0002-01-00-01.pdf",
      mimeType: "application/pdf",
      transformedUrl: {
        preview: "https://example.com/preview/pdf1",
        download: "https://example.com/download/pdf1",
      },
    },
    {
      id: "1-xYSScBcaGSAvygt9XojDBTbSH1eXcw7",
      name: "A-A-2503-0002-01-00-01-P1.jpg",
      mimeType: "image/jpeg",
      transformedUrl: {
        preview: "https://example.com/preview/img1",
        download: "https://example.com/download/img1",
      },
    },
    {
      id: "1MCHkiK532VNqQD5gf6daBctveSDsoWzB",
      name: "Copia de A-A-2503-0192-01-00-01.jpg",
      mimeType: "image/jpeg",
      transformedUrl: {
        preview: "https://example.com/preview/img2",
        download: "https://example.com/download/img2",
      },
    },
    {
      id: "1a-tHpS9rDbxUEtLixHq2jRL4nIQUpsXM",
      name: "Copia de A-A-2503-0192-01-00-05.png",
      mimeType: "image/png",
      transformedUrl: {
        preview: "https://example.com/preview/img3",
        download: "https://example.com/download/img3",
      },
    },
    {
      id: "1Y38dqb19uN7BtG6nxtHbM3v6OFM0QOU6",
      name: "Copia de A-A-2503-0192-01-00-06.png",
      mimeType: "image/png",
      transformedUrl: {
        preview: "https://example.com/preview/img4",
        download: "https://example.com/download/img4",
      },
    },
    {
      id: "1tf0SgqrNt8EfcZ2LPpWIemDkQE6Q_c8L",
      name: "Copia de A-A-2503-1109-01-02-01.jpg",
      mimeType: "image/jpeg",
      transformedUrl: {
        preview: "https://example.com/preview/img5",
        download: "https://example.com/download/img5",
      },
    },
    {
      id: "1jwifdnEMijKftTWGhpGmuuII1A8tqk84",
      name: "01_vimeo_contexto.txt",
      mimeType: "text/plain",
      transformedUrl: {
        preview: "https://example.com/preview/vimeo1",
        download: "https://example.com/download/vimeo1",
      },
    },
  ],
};
